import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Member } from './lib/membership.mts';
import { Box, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';
import { MouseEventHandler, useState } from 'react';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import CancelIcon from '@mui/icons-material/Cancel';
import Contact from './Contact';
import EditableCardImage from './EditableCardImage';

export type CrewCardProps = {
    member: Member
    contactEnabled?: boolean
    inviteEnabled?: boolean
    editEnabled?: boolean
    invited?: boolean
    profile?: string
    onSaveProfile?: Function
    onSaveInvited?: Function
    onAddImage?: Function
    onDeleteImage?: Function
    onUseAvatar?: Function
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
    profile = 'crewing',
    invited = false,
    onSaveProfile,
    onSaveInvited,
    onAddImage,
    onDeleteImage = () => console.log('delete image'),
    onUseAvatar,
}: CrewCardProps) {
    const name = `${member.firstname} ${member.lastname}`;
    const [text, setText] = useState<string>(((profile === 'skipper') ? member.profile : member.crewingprofile) ?? '');
    const [editProfile, setEditProfile] = useState(false);

    const handleTextChange = editProfile ? (value: string) => setText(value) : undefined;

    function handleSaveProfile() {
        setEditProfile(false);
        if (onSaveProfile) {
            onSaveProfile(profile, text);
        }
    }

    return (
        <Card sx={{ maxWidth: 345, minWidth: 250 }}>
            <Stack direction='column' justifyContent='space-between' height='100%'>
                <Stack direction='column'>
                    <EditableCardImage
                        editEnabled={editEnabled}
                        name={name}
                        id={member.id}
                        pictures={member.pictures || []}
                        onAddImage={onAddImage}
                        onDeleteImage={onDeleteImage}
                        onUseAvatar={onUseAvatar}
                        email={member.email ?? ''}
                    />
                    <CardContent>
                        <Stack direction='row' justifyContent='space-between'>
                            <Typography variant="h6">
                                {name}
                            </Typography>
                            <EditProfileButton
                                editEnabled={editEnabled}
                                editing={editProfile}
                                onEdit={() => setEditProfile(true)}
                                onSave={() => handleSaveProfile()}
                                onCancel={() => setEditProfile(false)}
                            />
                        </Stack>
                        <Profile text={text} onChange={handleTextChange} />
                    </CardContent>
                </Stack>
                <CardActions>
                    <FormControlLabel
                        control={<Checkbox
                            disabled={!inviteEnabled}
                            checked={invited}
                            onChange={(e) => onSaveInvited && onSaveInvited(e.target.checked)}
                        />}
                        label="Invite"
                    />
                    {contactEnabled ? <Contact memberGoldId={member.id} /> : ''}
                </CardActions>
            </Stack>
        </Card>
    );
}
