import { useState, SetStateAction, useEffect } from "react"
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, LinearProgress, TextField, Button, Stack, IconButton, Box } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import Photodrop from "./PhotoDrop"
import { postPhotos } from "./lib/postphotos"

interface EditableCardImageProps {
    editEnabled: boolean
    name: string
    email: string
    id: number
    pictures: string[]
    onAddImage?: Function
    onDeleteImage?: Function
    onUseAvatar?: Function
}

type CardImageProps = {
    editEnabled?: boolean
    onDelete: Function
    picture: string
    alt: string
}

function HeroImage({ src, alt, width, height }: { src: string, alt: string, width: number, height: number }) {
    if (src?.includes('?')) {
        return <img
            crossOrigin="anonymous"
            style={{ width: '100%' }}
            src={src}
            alt={alt}
            loading="lazy"
        />;
    }
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

function CardImage({ picture, alt, onDelete }: CardImageProps) {
    return <>
        <HeroImage src={picture} alt={alt} width={300} height={300} />
        <Box sx={{ position: "relative", color: "white", top: -45, left: "1%", width: 50, }}>
            <IconButton
                sx={{ color: 'white', background: 'rgba(100, 100, 100, 0.2)', }}
                aria-label='delete'
                onClick={() => onDelete()}
            >
                <DeleteIcon />
            </IconButton>
        </Box>
    </>;
}

export default function EditableCardImage({ editEnabled, id, name, email, pictures, onAddImage, onDeleteImage, onUseAvatar }: EditableCardImageProps) {
    const [progress, setProgress] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);
    const [imageChoice, setImageChoice] = useState<string>('nothing');
    const [url, setUrl] = useState<string>('');
    const [web, setWeb] = useState<string>('');

    useEffect(() => {
        let timeoutId: number | undefined;
        if (url !== '') {
            timeoutId = setTimeout(() => {
                if (url !== '') {
                    setUploading(false);
                    handleAddImage(url);
                }
            }, 2000);
        }

        // Cleanup function to clear the timeout if the component unmounts
        if (timeoutId) {
            return () => clearTimeout(timeoutId);
        }
    }, [url]);

    function handleAddImage(value: string) {
        if (onAddImage) {
            onAddImage(value);
        }
    }

    function handleChange(e: { target: { value: SetStateAction<string> } }) {
        setImageChoice(e.target.value);
        if (onUseAvatar) {
            onUseAvatar(e.target.value === 'avatar');
        }
    }

    function onDrop(files: File[]) {
        if (files.length === 0) {
            return;
        }
        setUploading(true);
        postPhotos(files, '', email, id, undefined, setProgress).then(
            (r: any) => {
                setUrl(r[0]);
            }
        );
    }

    function handleWebImage() {
        if (web !== '')
            handleAddImage(web);
    }

    function handleDeleteImage() {
        setImageChoice('nothing');
        if (onDeleteImage) {
            onDeleteImage();
        }
        if (onUseAvatar) {
            onUseAvatar(false);
        }
    }

    if (pictures.length > 0) {
        return <CardImage picture={pictures[0]} alt={name} editEnabled={editEnabled} onDelete={handleDeleteImage} />;
    }

    return <>
        <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">Show an image?</FormLabel>
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="radio-buttons-group"
                value={imageChoice}
                onChange={handleChange}
            >
                <FormControlLabel value="nothing" control={<Radio />} label="No Picture" />
                <FormControlLabel value="avatar" control={<Radio />} label="My Login Picture" />
                <FormControlLabel value="web" control={<Radio />} label="From Web" />
                <FormControlLabel value="upload" control={<Radio />} label="From This Device" />
            </RadioGroup>
        </FormControl>
        {
            (imageChoice === 'web')
                ?
                <Stack direction='row'>
                    <TextField
                        value={web}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setWeb(event.target.value)}
                        placeholder='type or paste a url'
                    />
                    <Button onClick={handleWebImage}>set</Button>
                </Stack>
                :
                (imageChoice === 'upload')
                    ?
                    <>
                        <Photodrop onDrop={onDrop} preview={false} />
                        {uploading ? <LinearProgress value={progress} /> : ''}
                    </>
                    :
                    ''
        }
    </>;
}