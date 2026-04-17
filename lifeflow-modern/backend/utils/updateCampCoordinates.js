// Migration script to update existing camps with coordinates
import { Camp } from '../config/db.js';
import { getCityCoordinatesWithFallback } from './geocoding.js';

export async function updateExistingCampsWithCoordinates() {
    try {
        console.log('🗺️ Updating existing camps with coordinates...');
        
        // Find camps without coordinates
        const campsWithoutCoords = await Camp.findAll({
            where: {
                lat: null,
                lng: null
            }
        });

        console.log(`Found ${campsWithoutCoords.length} camps without coordinates`);

        let updated = 0;
        for (const camp of campsWithoutCoords) {
            const coordinates = getCityCoordinatesWithFallback(camp.city);
            
            await camp.update({
                lat: coordinates.lat,
                lng: coordinates.lng
            });
            
            console.log(`✅ Updated ${camp.name} in ${camp.city} with coordinates: ${coordinates.lat}, ${coordinates.lng}`);
            updated++;
        }

        console.log(`🎉 Successfully updated ${updated} camps with coordinates`);
        return { success: true, updated };
    } catch (error) {
        console.error('❌ Error updating camp coordinates:', error);
        return { success: false, error: error.message };
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    updateExistingCampsWithCoordinates().then(() => {
        process.exit(0);
    });
}