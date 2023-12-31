import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { SailingProfile } from './lib/membership.mts';
import { Box, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';
import { MouseEventHandler, useState } from 'react';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import CancelIcon from '@mui/icons-material/Cancel';
import Contact from './Contact';
import EditableCardImage from './EditableCardImage';

export type CrewCardProps = {
    name: string
    goldId: number
    email: string
    profile?: SailingProfile
    contactEnabled?: boolean
    inviteEnabled?: boolean
    editEnabled?: boolean
    invited?: boolean
    onSaveProfile?: Function
    onSaveInvited?: Function
    onAddImage?: Function
    onDeleteImage?: Function
    onUseAvatar?: Function
}

function TextEdit({ text, onChange }: { text: string, onChange: Function | undefined }) {
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

function EditTextButton({ editEnabled, editing, onEdit, onSave, onCancel }: {
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
    name,
    goldId,
    email,
    profile,
    contactEnabled = false,
    inviteEnabled = false,
    editEnabled = false,
    invited = false,
    onSaveProfile,
    onSaveInvited,
    onAddImage,
    onDeleteImage = () => console.log('delete image'),
    onUseAvatar,
}: CrewCardProps) {
    const [text, setText] = useState<string>(profile?.text ?? '');
    const [editProfile, setEditProfile] = useState(false);

    const handleTextChange = editProfile ? (value: string) => setText(value) : undefined;

    function handleSaveProfile() {
        setEditProfile(false);
        if (onSaveProfile) {
            onSaveProfile(text);
        }
    }

    return (
        <Card sx={{ maxWidth: 345, minWidth: 250 }}>
            <Stack direction='column' justifyContent='space-between' height='100%'>
                <Stack direction='column'>
                    <EditableCardImage
                        editEnabled={editEnabled}
                        name={name}
                        id={goldId}
                        pictures={profile?.pictures || []}
                        onAddImage={onAddImage}
                        onDeleteImage={onDeleteImage}
                        onUseAvatar={onUseAvatar}
                        email={email ?? ''}
                    />
                    <CardContent>
                        <Stack direction='row' justifyContent='space-between'>
                            <Typography variant="h6">
                                {name}
                            </Typography>
                            <EditTextButton
                                editEnabled={editEnabled}
                                editing={editProfile}
                                onEdit={() => setEditProfile(true)}
                                onSave={() => handleSaveProfile()}
                                onCancel={() => setEditProfile(false)}
                            />
                        </Stack>
                        <TextEdit text={text} onChange={handleTextChange} />
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
                    {contactEnabled ? <Contact memberGoldId={goldId} /> : ''}
                </CardActions>
            </Stack>
        </Card>
    );
}
