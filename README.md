# QRCodeAPLSkill
This skill displays a dynamically generated QR Code as an [AVG](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-avg-format.html) (SVG subset) element on multi-modal Alexa devices (support [APL 1.1+](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-vectorgraphic.html)). The skill can generate the QR code at time of skill interaction. This requires no cloud storage as all operations are completed in memory. This skill uses only pure JavaScript so no native binaries are required.

Warm Lambda execution < 100ms (7ms-89ms) in testing (median closer to 10) at 512 MB configuration. This has not been fully performance tested.

The QR Code is generated using [qrcode-svg](https://www.npmjs.com/package/qrcode-svg), covered into a DOM object using [xmldom](https://www.npmjs.com/package/xmldom), and then converted into AVG using [SVGtoAVG](https://svgtoavg.glitch.me/) by [Arjun](https://arjun-g.com/) modified for Node.js.

## Skill
This skill is a barebones skill just meant to display a QR Code. It only has one primary interaction which displays a screen like the below on multi-modal Alexa devices.
![QR Code on Echo Show 5](https://raw.githubusercontent.com/willblaschko/QRCodeAPLSkill/main/screenshot.jpg)

## Bugs, issues and enhancements  

This project is presented as-is. Please submit a pull request if required.


## License  
  
The QR Code APL Skill is under the [Apache License 2.0](https://github.com/willblaschko/QRCodeAPLSkill/blob/main/LICENSE.txt).  