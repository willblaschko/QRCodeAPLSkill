/*
Main handler for the QR Code Demo skill, this skill displays a dynamically generated QR Code
as an AVG (SVG subset) element on screen devices. This requires no cloud storage and can
generate the code at time of skill interaction dynamically.

Lambda execution < 100ms (7ms-89ms) in testing (median closer to 10) at 512 MB configuration.

QR Code is generated using qrcode-svg, covered into a DOM object using xmldom, and then converted
into AVG using SVGtoAVG (modified for Node.js from https://svgtoavg.glitch.me/ by Arjun 
https://arjun-g.com/)

*/

//Alexa ASK core library
const Alexa = require('ask-sdk-core');

//xmldom used to parse the SVG DOM
const { DOMParser } = require('xmldom')
const domParser = new DOMParser();

//qrcode-svg used to generate the initial QR Code SVG
const QRCode = require("qrcode-svg");

//SVGtoAVG modified for Node.js from https://svgtoavg.glitch.me/ by Arjun https://arjun-g.com/
const SVGtoAVG = require("./svgtoavg");

//Our APL resources
const aplDocument = require("./apl/main.json");
const aplData = require("./apl/main_data.json");


//This handler will handle all IntentRequests and LaunchRequests (but lower priority than)
//StopIntent/CancelIntent. This is not best practice, but used this way for the demo.
const LaunchRequestHandler = {

    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' || Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';

    },
    async handle(handlerInput) {

        //todo get this content dynamically
        let content = "http://lightmeter.dev/?time=" + Date.now();

        //check that our device supports APL, if so, send the APL document
        //don't do any of the expensive work of creating the AVG if not
        if (handlerInput.supportsAPL()) {


            //create a new QR Code using the content above
            let qrcode = new QRCode({
                content: content,
                width: 500,
                height: 500,
                color: "#FFFFFF", //for dark theme
                background: "#000000", //for dark theme
                join: true, //required because AVG supports path
                ecl: "M",
            });

            //convert the QR Code into the SVG XML
            let svg = qrcode.svg();

            //parse the DOM of the XML
            let result = domParser.parseFromString(svg, 'text/xml');

            //convert the SVG QR Code into an AVG QR Code
            let avg = await SVGtoAVG(result);

            //add the AVG QR Code to our APL document as a graphic
            //this will overwrite all other items in the graphics object
            aplDocument.graphics = { "QRCode": avg }

            //do a crude variable replacement in the APL data
            let data = JSON.stringify(aplData);
            data = data.replace("%TITLE%", "QR Code For");
            data = data.replace("%SUBTITLE%", content);

            //add the APL document to the response
            handlerInput.responseBuilder
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    token: 'displayDocument',
                    document: aplDocument,
                    datasources: JSON.parse(data)
                });
        }

        //A response for headless devices, since no visuals
        let speakOutput = "QR Code for " + content;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

//Boilerplate Cancel/Stop Intent Handler
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

//Boilerplate Session Ended Request Handler
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

//Request handler designed for verbose logging and to add the supportsAPL() function
const RequestHandler = {
    process(handlerInput) {
        //log our request
        console.log("Type: " + handlerInput.requestEnvelope.request.type);
        if (handlerInput.requestEnvelope.request.intent) {
            console.log("Intent: " + handlerInput.requestEnvelope.request.intent.name);
        }
        console.log("REQUEST ENVELOPE = " + JSON.stringify(handlerInput.requestEnvelope));

        handlerInput.supportsAPL = function () {
            const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
            const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
            return (aplInterface !== null && aplInterface !== undefined);
        }
    }
};

//Response handler designed for verbose logging
const ResponseHandler = {
    process(handlerInput) {
        console.log("RESPONSE ENVELOPE = " + JSON.stringify(handlerInput.responseBuilder.getResponse()));
        return;
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        CancelAndStopIntentHandler,
        LaunchRequestHandler,
        SessionEndedRequestHandler
    )

    .addRequestInterceptors(RequestHandler)
    .addResponseInterceptors(ResponseHandler)
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();