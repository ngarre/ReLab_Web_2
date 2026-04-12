import PlaceholderImage from '../assets/images/placeholder-default.jpg';
import { BASE_URL } from './api';

export function getProductImageUrl(
    imagePath?: string | null,
    hasImageError = false
): string {
    if (!imagePath || hasImageError) {
        return PlaceholderImage;
    }

    return `${BASE_URL}${imagePath}`;
}