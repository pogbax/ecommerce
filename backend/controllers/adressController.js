import Address from '../models/Address.js';

// Get all addresses for a user
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching addresses", error: error.message });
    }
};

// Add a new address
const addAddress = async (req, res) => {
    const { fullName, phoneNumber, streetAddress, city, country, postalCode } = req.body;
    if (!fullName || !phoneNumber || !streetAddress || !city || !country || !postalCode) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const newAddress = new Address({
            user: req.user._id,
            fullName,
            phoneNumber,
            streetAddress,
            city,
            country,
            postalCode
        });
        await newAddress.save();
        res.status(201).json(newAddress);
    } catch (error) {
        res.status(500).json({ message: "Error adding address", error: error.message });
    }
};

// Update an existing address
const updateAddress = async (req, res) => {
    const { addressId } = req.params;
    const { fullName, phoneNumber, streetAddress, city, country, postalCode } = req.body;
    if (!fullName || !phoneNumber || !streetAddress || !city || !country || !postalCode) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const updatedAddress = await Address.findByIdAndUpdate(addressId, {
            fullName,
            phoneNumber,
            streetAddress,
            city,
            country,
            postalCode
        }, { new: true });
        if (!updatedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.json(updatedAddress);
    } catch (error) {
        res.status(500).json({ message: "Error updating address", error: error.message });
    }
};

// Delete an address
const deleteAddress = async (req, res) => {
    const { addressId } = req.params;
    try {
        const deletedAddress = await Address.findByIdAndDelete(addressId);
        if (!deletedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting address", error: error.message });
    }
};

export { getAddresses, addAddress, updateAddress, deleteAddress };
