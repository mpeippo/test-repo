/*
 * Copyright (c) 2014-2017 Cesanta Software Limited
 * All rights reserved
 *
 * Arduino BME280 library API wrapper
 */

#ifndef CS_MOS_LIBS_ARDUINO_BME280_SRC_MGOS_ARDUINO_BME280_H_
#define CS_MOS_LIBS_ARDUINO_BME280_SRC_MGOS_ARDUINO_BME280_H_

#include "BME280.h"

#ifdef __cplusplus
extern "C" {
#endif

#define MGOS_BME280_RES_FAIL -10000

// Initialize BME280 library.
// Return value: OneWire handle opaque pointer.
BME280 *mgos_bme280_create();

// Close BME280 handle. Return value: none.
void mgos_bme280_close(BME280 *bme);

// Initialize the sensor with given parameters/settings.
// Returns 0 if the sensor not plugged or a checking failed,
// i.e. the chip ID is incorrect.
// Returns 1 otherwise.
int mgos_bme280_begin(BME280 *bme, int addr);

// Take a new measurement (only possible in forced mode).
void mgos_bme280_take_forced_measurement(BME280 *bme);

// Returns the temperature from the sensor in degrees C * 100
// or MGOS_BME280_RES_FAIL if an operation failed.
int mgos_bme280_read_temperature(BME280 *bme);

// Returns the pressure from the sensor in hPa * 100
// or MGOS_BME280_RES_FAIL if an operation failed.
int mgos_bme280_read_pressure(BME280 *bme);

// Returns the humidity from the sensor in %RH * 100
// or MGOS_BME280_RES_FAIL if an operation failed.
int mgos_bme280_read_humidity(BME280 *bme);

// Returns the altitude in meters * 100 calculated from the specified
// atmospheric pressure (in hPa), and sea-level pressure (in hPa * 100)
// or MGOS_BME280_RES_FAIL if an operation failed.
// http://www.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf, P.16
int mgos_bme280_read_altitude(BME280 *bme, int seaLevel);

// Returns the pressure at sea level in hPa * 100
// calculated from the specified altitude (in meters * 100),
// and atmospheric pressure (in hPa * 100)
// or MGOS_BME280_RES_FAIL if an operation failed.
// http://www.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf, P.17
int mgos_bme280_sea_level_for_altitude(BME280 *bme,
                                       int altitude,
                                       int pressure);

#ifdef __cplusplus
}
#endif


#endif /* CS_MOS_LIBS_ARDUINO_BME280_SRC_MGOS_ARDUINO_BME280_H_ */
