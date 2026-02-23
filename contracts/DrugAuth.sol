// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DrugAuth {
    // Maps UUID -> active status (true = authentic/unsold, false = burned/fake)
    mapping(string => bool) private registeredMedicines;

    event MedicineRegistered(string uuid);
    event MedicineVerifiedAndBurned(string uuid);

    /// @notice Called by manufacturer to register a medicine batch
    function registerMedicine(string calldata uuid) external {
        require(!registeredMedicines[uuid], "Already registered");
        registeredMedicines[uuid] = true;
        emit MedicineRegistered(uuid);
    }

    /// @notice Called by consumer on scan — returns authentic and burns, or reverts if fake/used
    function verifyAndBurn(string calldata uuid) external {
        require(registeredMedicines[uuid], "Fake or already used");
        registeredMedicines[uuid] = false;
        emit MedicineVerifiedAndBurned(uuid);
    }

    /// @notice Read-only check (for debugging/UI previews, doesn't consume the token)
    function isRegistered(string calldata uuid) external view returns (bool) {
        return registeredMedicines[uuid];
    }
}
