// Copyright Epic Games, Inc. All Rights Reserved.

import { Config, Flags, PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.3';
import { Application, UIOptions, PanelConfiguration, UIElementCreationMode, PixelStreamingApplicationStyle } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.3';
const PixelStreamingApplicationStyles =
    new PixelStreamingApplicationStyle();
PixelStreamingApplicationStyles.applyStyleSheet();

document.body.onload = function() {
	// Example of how to set the logger level
	// Logger.SetLoggerVerbosity(10);

	// Create a config object
	const config = new Config({
		initialSettings: {
			AutoPlayVideo: true,
			AutoConnect: true,
			StartVideoMuted: true,
			WaitForStreamer: true,
		},
		useUrlParams: true,
		});
	config.setFlagEnabled(Flags.HoveringMouseMode, true);
	config.setFlagEnabled(Flags.FakeMouseWithTouches, true);
	config.setFlagEnabled(Flags.MouseInput, true);
	// config.setFlagEnabled(Flags.KeyboardInput, false);
	// config.setFlagEnabled(Flags.TouchInput, false);
	// config.setFlagEnabled(Flags.GamepadInput, false);
	// config.setFlagEnabled(Flags.XRControllerInput, false);

	// Create a Native DOM delegate instance that implements the Delegate interface class
	const stream = new PixelStreaming(config);

	const application = new Application({
		stream,
		onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode),
		settingsPanelConfig: { 
			isEnabled : false,
			visibilityButtonConfig : { creationMode : UIElementCreationMode.Disable }
		},
		statsPanelConfig:
		{
			isEnabled : false,
			visibilityButtonConfig : { creationMode : UIElementCreationMode.Disable }
		},
		fullScreenControlsConfig:
		{
			creationMode : UIElementCreationMode.Disable
		},
		videoQpIndicatorConfig: {
			disableIndicator: true
		}
	});
	// document.getElementById("centrebox").appendChild(application.rootElement);
	document.body.appendChild(application.rootElement);
}
