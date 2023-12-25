import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Member } from './lib/membership.mts';
import { Box, Stack } from '@mui/material';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';
import { MouseEventHandler, useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import CancelIcon from '@mui/icons-material/Cancel';

export type CrewCardProps = {
    member: Member
    contactEnabled?: boolean
    inviteEnabled?: boolean
    profile?: string
    editEnabled?: boolean
    onSave?: Function
}

type CardImageProps = {
    editEnabled: boolean
    onDelete: Function
    pictures: Picture[]
}

type Picture = {
    title: string
    img: string
    use: boolean
    primary: boolean
}

function HeroImage({ src, alt, width, height }: { src: string, alt: string, width: number, height: number }) {
    const rows = 1;
    const cols = 1;
    const s = `${src}?w=${width * cols}&h=${height * rows}&fit=crop&auto=format`;
    return <img
        style={{ width: '100%' }}
        src={s}
        srcSet={`${s}&dpr=2 2x`}
        alt={alt}
        loading="lazy"
    />;
}

type CustomImageListItemProps = {
    item: any
    onDelete: MouseEventHandler
}

function CustomImageListItem({ item, onDelete }: CustomImageListItemProps) {
    const [favourite, setFavourite] = useState(false);

    return <ImageListItem key={item.img} cols={2} rows={1}>
        <HeroImage src={item.img} alt={item.title} width={320} height={300} />
        <ImageListItemBar
            sx={{
                background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
                    'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
            }}
            title={item.title}
            position="top"
            actionIcon={
                <IconButton
                    onClick={() => setFavourite(!favourite)}
                    sx={{ color: 'white' }}
                    aria-label={`favourite ${item.title}`}
                >
                    {favourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
            }
            actionPosition="left"
        />
        <ImageListItemBar
            sx={{
                background:
                    'linear-gradient(to top, rgba(0,0,0,0.7) 0%, ' +
                    'rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 100%)',
            }}
            position="bottom"
            actionIcon={
                <IconButton
                    onClick={onDelete}
                    sx={{ color: 'white' }}
                    aria-label={`delete ${item.title}`}
                >
                    <DeleteOutlineIcon />
                </IconButton>
            }
            actionPosition="left"
        />
    </ImageListItem>;
}

function CustomImageList({ pictures, onDelete, editEnabled }: CardImageProps) {
    function handleDelete(index: number) {
        onDelete(index)
    }
    if (!editEnabled) {
        if (pictures.length === 0) {
            return '';
        }
        return <HeroImage src={pictures[0].img} alt={pictures[0].title} width={300} height={300} />;
    }
    return (
        <ImageList
            sx={{
                width: 350,
                height: 310,
                // Promote the list into its own layer in Chrome. This costs memory, but helps keeping high FPS.
                transform: 'translateZ(0)',
                gridAutoFlow: "column",
                gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr)) !important",
                gridAutoColumns: "minmax(180px, 1fr)"
            }}
            rowHeight={300}
            gap={1}
        >
            {pictures.map((item, index) => <CustomImageListItem key={index} item={item} onDelete={() => handleDelete(index)} />)}
        </ImageList>
    );
}

function CardImage({ pictures, onDelete, editEnabled }: CardImageProps) {
    if (pictures.length > 0) {
        return <CustomImageList editEnabled={editEnabled} pictures={pictures} onDelete={onDelete} />
    }
    return '';
    // return <Skeleton variant="rounded" animation='wave' width='100%' height={240} />
}

function Profile({ text, onChange }: { text: string, onChange: Function | undefined }) {
    if (onChange) {
        return <Box sx={{ display: 'flex' }}>
            <Box sx={{
                m: 1, border: 1, paddingBottom: 1, height: '15rem', width: '100%',
            }}
            >
                <ReactTinyEditor html={text} onChange={onChange} />
            </Box>
        </Box>
    }
    return <Typography
        variant="body2"
        color="text.secondary"
        component="div"
        dangerouslySetInnerHTML={{ __html: text.trim() }}
    />
}

function EditProfileButton({ editEnabled, editing, onEdit, onSave, onCancel }: {
    editEnabled: boolean,
    editing: boolean,
    onEdit: MouseEventHandler,
    onSave: MouseEventHandler,
    onCancel: MouseEventHandler
}) {
    if (editing) {
        return <>
            <IconButton onClick={onSave} ><PublishedWithChangesIcon /></IconButton>
            <IconButton onClick={onCancel} ><CancelIcon /></IconButton>
        </>;
    }
    if (editEnabled) {
        return <IconButton onClick={onEdit} ><ModeEditIcon /></IconButton>;
    }
    return '';
}

export default function CrewCard({
    member,
    contactEnabled = false,
    inviteEnabled = false,
    editEnabled = false,
    profile = 'crewingprofile',
    onSave,
}: CrewCardProps) {
    const [text, setText] = useState<string>(((profile === 'profile') ? member.profile : member.crewingprofile) ?? '');
    const [editProfile, setEditProfile] = useState(false);
    const name = `${member.firstname} ${member.lastname}`;
    const [pictures, setPictures] = useState<Picture[]>((member.pictures || []).map((p) => ({
        title: name,
        img: p,
        use: false,
        primary: false,
    })));
    const handleTextChange = editProfile ? (value: string) => setText(value) : undefined;

    function handleDelete(index: number) {
        const p = [...pictures];
        p.splice(index, 1)
        setPictures(p);
    }

    function handleSave() {
        setEditProfile(false);
        if (onSave) {
            onSave(profile, text, pictures);
        }
    }

    return (
        <Card sx={{ maxWidth: 345, minWidth: 250 }}>
            <CardImage pictures={pictures} editEnabled={editEnabled} onDelete={handleDelete} />
            <CardContent>
                <Stack direction='row' justifyContent='space-between'>
                    <Typography variant="h6">
                        {name}
                    </Typography>
                    <EditProfileButton
                        editEnabled={editEnabled}
                        editing={editProfile}
                        onEdit={() => setEditProfile(true)}
                        onSave={() => handleSave()}
                        onCancel={() => setEditProfile(false)}
                    />
                </Stack>
                <Profile text={text} onChange={handleTextChange} />
            </CardContent>
            <CardActions>
                <Button size='small' disabled={!inviteEnabled}>More</Button>
                <Button size='small' disabled={!inviteEnabled}>Invite</Button>
                <Button size='small' disabled={!contactEnabled}>Contact</Button>
            </CardActions>
        </Card>
    );
}
