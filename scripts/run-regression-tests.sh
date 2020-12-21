#!/bin/bash

echo 'Running tests in firefox...';
BROWSER=firefox jest --config test/regression/__config__/jest.config.js;

echo 'Running tests in chromium...';
BROWSER=chromium jest --config test/regression/__config__/jest.config.js;

echo 'Running tests in webkit...';
BROWSER=webkit jest --config test/regression/__config__/jest.config.js;

echo 'Running Profiler tests in firefox...';
BROWSER=firefox PROFILER=true jest --config test/regression/__config__/jest.config.js;

echo 'Running Profiler tests in chromium...';
BROWSER=chromium PROFILER=true jest --config test/regression/__config__/jest.config.js;

echo 'Running Profiler tests in webkit...';
BROWSER=webkit PROFILER=true jest --config test/regression/__config__/jest.config.js;