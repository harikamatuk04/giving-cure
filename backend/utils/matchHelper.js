const Request = require("../models/Request");
const Inventory = require("../models/Inventory");
const Notification = require("../models/Notification");

// Check for potential matches and create notifications
exports.checkAndCreateMatchNotifications = async () => {
  try {
    // Get all requests and inventories
    const requests = await Request.find();
    const inventories = await Inventory.find();

    // For each request, check if there are matching inventory items
    for (const request of requests) {
      // Find matching inventory items
      const matchingInventories = inventories.filter((inventory) => {
        const itemMatches = inventory.item === request.item;
        const quantityMatches = inventory.qty >= request.qty;
        return itemMatches && quantityMatches;
      });

      // If there are matches, create a notification
      if (matchingInventories.length > 0) {
        // Get list of hospitals that have the item
        const hospitalsWithItem = matchingInventories.map(inv => inv.org);
        const hospitalsList = hospitalsWithItem.length === 1 
          ? hospitalsWithItem[0]
          : hospitalsWithItem.slice(0, -1).join(", ") + " and " + hospitalsWithItem[hospitalsWithItem.length - 1];

        // Check if notification already exists for this request
        const existingNotification = await Notification.findOne({
          type: "potential_match",
          requestId: request._id.toString()
        });

        // Only create if it doesn't exist
        if (!existingNotification) {
          const message = `${request.org} is requesting ${request.qty} of ${request.item}. Available at: ${hospitalsList}`;
          
          await Notification.create({
            type: "potential_match",
            requestId: request._id.toString(),
            hospital: request.org,
            city: request.city,
            item: request.item,
            quantity: request.qty,
            urgency: request.urgency,
            message: message
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking for matches:", error);
    // Don't throw - this is a background process
  }
};


