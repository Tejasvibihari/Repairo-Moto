import React, { useState, useEffect } from 'react';

const AssignMechanic = ({ employees, orderData, onUpdateMechanic }) => {
    const [mechanics, setMechanics] = useState([]);
    const [selectedMechanic, setSelectedMechanic] = useState({
        name: '',
        id: null,
    });

    useEffect(() => {
        // Filter only mechanics
        const filteredMechanics = employees.filter(emp => emp.position === 'mechanic');
        setMechanics(filteredMechanics);

        // Set default selected mechanic if already assigned
        if (orderData.assignedMechanic) {
            setSelectedMechanic({
                name: orderData.assignedMechanic,
                id: orderData.mechanicId,
            });
        }
    }, [employees, orderData]);

    const handleAssign = (e) => {
        const mechanicId = e.target.value;
        const mechanic = mechanics.find(m => m._id === mechanicId);

        if (mechanic) {
            setSelectedMechanic({ name: `${mechanic.firstName} ${mechanic.lastName}`, id: mechanic._id });

            // Optional: Call an API or prop method to update in DB
            onUpdateMechanic({
                assignedMechanic: `${mechanic.firstName} ${mechanic.lastName}`,
                mechanicId: mechanic._id,
            });

            // Show in console
            console.log(`${mechanic.firstName} ${mechanic.lastName}`, 'assignedMechanic');
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <div className='flex flex-row gap-2'>
                <div className='font-semibold'>Currently Assigned:</div> {selectedMechanic.name || 'None'}
            </div>
            <label className='font-semibold'>Assign Mechanic:</label>
            <select className='p-1 border border-gray-400 ml-3' value={selectedMechanic.id || ''} onChange={handleAssign}>
                <option value="">Select Mechanic</option>
                {mechanics.map(mechanic => (
                    <option key={mechanic._id} value={mechanic._id}>
                        {mechanic.firstName} {mechanic.lastName}
                    </option>
                ))}
            </select>
            <button className='border py-1'>
                Save
            </button>
        </div>
    );
};

export default AssignMechanic;
