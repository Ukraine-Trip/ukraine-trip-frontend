import { useMapEvents } from 'react-leaflet';

interface ZoomHandlerProps {
    setZoom: (zoom: number) => void;
}

export const ZoomHandler = ({ setZoom }: ZoomHandlerProps) => {
    useMapEvents({
        zoomend: (e) => {
            setZoom(e.target.getZoom());
        },
    });
    return null;
};