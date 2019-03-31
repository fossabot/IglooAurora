self.addEventListener("push", function(event) {
  const pushData = JSON.parse(event.data.text())
  let title
  let actions

  switch (pushData.type) {
    case "DEVICE_NOTIFICATION":
      title = pushData.device.name
      break

    case "SHARE_RECEIVED_NOTIFICATION":
      title = "Environment shared with you"
      actions = [
        {
          action: "accept",
          title: "Accept",
          icon: "/images/demos/action-1-128x128.png",
        },
        {
          action: "decline",
          title: "Decline",
          icon: "/images/demos/action-2-128x128.png",
        },
      ]
      break

    case "SHARE_ACCEPTED_NOTIFICATION":
      title = "You share was accepted"
      break

    case "CHANGE_OWNER_RECEIVED_NOTIFICATION":
      title = "Ownership transfer requested"
      actions = [
        {
          action: "accept",
          title: "Accept",
          icon: "/images/demos/action-1-128x128.png",
        },
        {
          action: "decline",
          title: "Decline",
          icon: "/images/demos/action-2-128x128.png",
        },
      ]
      break

    case "OWNER_CHANGE_ACCEPTED_NOTIFICATION":
      title = "Your ownership transfer was accepted"
      break

    default:
      break
  }

  let options
  if ("actions" in Notification.prototype) {
    options = {
      body: pushData.content,
      dir: "auto",
      actions,
      timestamp: Date.parse(pushData.date),
    }
  } else {
    options = {
      body: pushData.content,
      dir: "auto",
      timestamp: Date.parse(pushData.date),
    }
  }

  const notification = self.registration.showNotification(title, options)
  event.waitUntil(notification)
})
