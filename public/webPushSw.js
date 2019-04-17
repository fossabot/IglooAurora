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
        },
        {
          action: "decline",
          title: "Decline",
        },
      ]
      break

    case "SHARE_ACCEPTED_NOTIFICATION":
      title = "Your share got accepted"
      break

    case "CHANGE_OWNER_RECEIVED_NOTIFICATION":
      title = "Ownership transfer requested"
      actions = [
        {
          action: "accept",
          title: "Accept",
        },
        {
          action: "decline",
          title: "Decline",
        },
      ]
      break

    case "OWNER_CHANGE_ACCEPTED_NOTIFICATION":
      title = "Your ownership transfer got accepted"
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
      tag: pushData.id,
    }
  } else {
    options = {
      body: pushData.content,
      dir: "auto",
      timestamp: Date.parse(pushData.date),
      tag: pushData.id,
    }
  }

  const notification = self.registration.showNotification(title, options)
  event.waitUntil(notification)
})
