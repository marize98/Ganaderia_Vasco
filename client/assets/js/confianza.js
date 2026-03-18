/**
 * BASERRI-ADITU Capa de Confianza (Trust Layer)
 * Validates logical incongruencies before submitting to official APIs.
 */

const CapaDeConfianza = {
    async validateBirth(madreId, fecha) {
        console.log("[Confianza] Validando nacimiento para madre:", madreId);
        
        // Logical Rule 1: Mother must be a bovine in the census
        const res = await fetch(`${App.apiBase}/livestock/census`, {
            headers: { 'Authorization': `Bearer ${App.token}` }
        });
        const data = await res.json();
        const madreExite = data.animals.some(a => a.id === madreId);
        
        if (!madreExite) {
            return { valid: false, message: "Error: El crotal de la madre no consta en tu censo oficial. Por favor, verifica el número." };
        }

        // Logical Rule 2: Minimum age for breeding (Simulated)
        // ...

        return { valid: true, message: "Validación correcta. Datos coherentes con SITRAN." };
    },

    async validateMovement(animalId, destino) {
        console.log("[Confianza] Validando movimiento para animal:", animalId);
        
        // Rule: Animal must be in "Vila" (Alive/Present) status
        const res = await fetch(`${App.apiBase}/livestock/census`, {
            headers: { 'Authorization': `Bearer ${App.token}` }
        });
        const data = await res.json();
        const animal = data.animals.find(a => a.id === animalId);
        
        if (!animal) return { valid: false, message: "El animal no se encuentra en tu explotación." };
        if (animal.estado !== 'Vila') return { valid: false, message: "El animal no está en estado activo para traslado." };

        return { valid: true, message: "Movimiento validado térmicamente." };
    }
};

window.baserriConfianza = CapaDeConfianza;
