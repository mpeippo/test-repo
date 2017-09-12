load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load('api_bme280.js');

let led = Cfg.get('pins.led');
let button = Cfg.get('pins.button');
let topic = '/device/' + Cfg.get('device.id') + '/events';
let sens_addr = 0x76;

// Tick tock
let toggle = 0;
let bme_ok = false;
let measurement_valid = 0;

let r_t = 0;
let r_p = 0;
let r_h = 0;

let bme = BME280.create();

// Initialize the sensor
if (bme.begin(sens_addr) === 0) {
	print('Cant find a sensor');
} else {
	print('BME280 ok');
	bme_ok = true;
}


print('LED GPIO:', led, 'button GPIO:', button);

let getInfo = function() {
	return JSON.stringify({
		total_ram: Sys.total_ram(),
		free_ram: Sys.free_ram()
	});
};

// Blink built-in LED every second
GPIO.set_mode(led, GPIO.MODE_OUTPUT);




Timer.set(2000 /* 2 sec */, true /* repeat */, function() {
	// Set GPIO
	GPIO.write(led, 1);

	let update = 0;
	let _t = 0.0;
	let _h = 0.0;
	let _p = 0.0;
	
	if (bme_ok) {
		_t = bme.readTemperature();
		_h = bme.readHumidity();
		_p = bme.readPressure();

		if (((_t - r_t) > 1.0) || ((_t - r_t) < -1.0)) {
			r_t = _t;
			update = 1;
		}
		if (((_h - r_h) > 1.0) || ((_h - r_h) < -1.0)) {
			r_h = _h;
			update = 1;
		}
		if (((_p - r_p) > 5.0) || ((_p - r_p) < -5.0)) {
			r_p = _p;
			update = 1;
		}
	}

	if (update || (Sys.uptime() > measurement_valid)) {
		update = 0;
		print('Temperature:', _t, '*C  Humidity:', _h, '%RH   Pressure:', _p, 'hPa');
		measurement_valid = Sys.uptime() + 30;
		let meas_topic = '/device/' + Cfg.get('device.id') + '/measurement';
		let msg = JSON.stringify({ temp: _t , hum: _h, atm: _p });
		let ok = MQTT.pub(meas_topic, msg, 1);
		print('Published:', ok, 'Topic=', meas_topic, '->', msg);
	}

	print(toggle ? 'Tick' : 'Tock', 'uptime:', Sys.uptime(), getInfo());
	toggle = (toggle ? 0:1);

	// Clear LED after 75ms
	Timer.set(75 /* 75msec */, false /* repeat */, function() {
		GPIO.write(led, 0);
	}, null);
}, null);


// Publish to MQTT topic on a button press. Button is wired to GPIO pin 0
GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
	let message = getInfo();
	let msg = JSON.stringify({ button: button , uptime: Sys.uptime()/100 });
	let ok = MQTT.pub(topic, msg, 1);
	print('Published:', ok, 'Topic=', topic, '->', msg);
}, null);


// Monitor network connectivity.
Net.setStatusEventHandler(function(ev, arg) {
	let evs = '???';
	if (ev === Net.STATUS_DISCONNECTED) {
		evs = 'DISCONNECTED';
	} else if (ev === Net.STATUS_CONNECTING) {
		evs = 'CONNECTING';
	} else if (ev === Net.STATUS_CONNECTED) {
		evs = 'CONNECTED';
	} else if (ev === Net.STATUS_GOT_IP) {
		evs = 'GOT_IP';
	}
	print('== Net event:', ev, evs);
}, null);
