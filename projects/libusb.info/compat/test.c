#include <stdio.h>
#include <usb.h>

int main(void)
{
	struct usb_bus *busses;
	struct usb_bus *bus;

	usb_init();
	usb_find_busses();
	usb_find_devices();

	busses = usb_get_busses();
	for (bus = busses; bus; bus = bus->next) {
		struct usb_device *dev;
		for (dev = bus->devices; dev; dev = dev->next) {
			printf("%04x:%04x\n",
				dev->descriptor.idVendor, dev->descriptor.idProduct);
		}
	}

	return 0;
}