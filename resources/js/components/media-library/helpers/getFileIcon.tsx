import { FileArchiveIcon, FileAudioIcon, FileCodeIcon, FileCogIcon, FileIcon, FileTextIcon, FileVideoIcon, ImageIcon } from 'lucide-react';
import { MediaItem } from './mediaLibraryApi';

export function getFileIcon(file: MediaItem) {
    const type = file.mime_type;
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (!type) {
        return <FileCogIcon />;
    }

    // ✅ Images
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(extension)) {
        return <ImageIcon />;
    }

    if (type.startsWith('video/')) {
        return <FileVideoIcon />;
    }

    if (type.startsWith('audio/')) {
        return <FileAudioIcon />;
    }

    if (type.startsWith('text/') || type.startsWith('application/') || ['txt', 'md', 'rtf', 'pdf'].includes(extension)) {
        return <FileTextIcon />;
    }

    if (['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml', 'php', 'py', 'rb', 'java', 'c', 'cpp', 'cs'].includes(extension)) {
        return <FileCodeIcon />;
    }

    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
        return <FileArchiveIcon />;
    }

    if (['exe', 'msi', 'app', 'apk', 'deb', 'rpm'].includes(extension) || type.startsWith('application/')) {
        return <FileCogIcon />;
    }

    return <FileIcon />;
}
