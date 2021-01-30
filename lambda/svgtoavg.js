/** https://svgtoavg.glitch.me/ **/
function buildItems(children){
    let items = Array.from(children).map(child => {
        if(child.tagName != 'g' && child.tagName != 'path')
            return null;
        let style = {};

        var styles = child.getAttribute("style").split(';');

        for (var i = 0; i < styles.length; i++) {
            var entry = styles[i].split(':');
            style[entry.splice(0,1)[0]] = entry.join(':');
        }

        let transform = parseTransform(child.getAttribute('transform') || (style.transform != 'none' ? style.transform : null));
        return {
            type: child.tagName === 'g' ? 'group' : 'path',
          
            pathData: child.getAttribute('d') || undefined,  
          
            fillOpacity: style.fillOpacity && style.fillOpacity != '1' ? parseFloat(style.fillOpacity) : undefined,
            fill: style.fill && style.fill != 'rgb(0, 0, 0)' ? style.fill : undefined,
            strokeOpacity: style.strokeOpacity && style.strokeOpacity != '1' ? parseFloat(style.strokeOpacity) : undefined,
            stroke: style.stroke && style.stroke != 'none' ? style.stroke : undefined,
            strokeWidth: style.strokeWidth && style.strokeWidth != '1px' ? parseInt(style.strokeWidth, 10) : undefined,
            opacity: style.opacity && style.opacity != '1' ? parseFloat(style.opacity) : undefined,
          
            rotation: transform && transform.rotate && transform.rotate[0] && parseInt(transform.rotate[0], 10),
            pivotX: transform && transform.rotate && transform.rotate[1] && parseInt(transform.rotate[1], 10),
            pivotY: transform && transform.rotate && transform.rotate[2] && parseInt(transform.rotate[2], 10),
            scaleX: transform && transform.scale && transform.scale[0] && parseInt(transform.scale[0], 10),
            scaleY: transform && transform.scale && transform.scale[1] && parseInt(transform.scale[1], 10),
            translateX: transform && transform.translate && transform.translate[0] && parseInt(transform.translate[0], 10),
            translateY: transform && transform.translate && transform.translate[1] && parseInt(transform.translate[1], 10),
          
            items: child.children && buildItems(child.children)
        }
    }).filter(child => !!child);
    return items.length > 0 ? items : undefined;
}

/** https://stackoverflow.com/questions/17824145/parse-svg-transform-attribute-with-javascript **/
function parseTransform(transform){
    if(!transform) return undefined;
    let result = {};
    for(let i in transform = transform.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*[, ]?)+\))+/g)){
         let res = transform[i].match(/[\w\.\-]+/g);
        result[res.shift()] = res;
    }
    return result;
}

module.exports = async svgDom => {
    let svgEle = svgDom.getElementsByTagName("svg")[0];
    console.log("--");
    console.log(svgEle);
    let respJson = {
        type: 'AVG',
        version: '1.0'
    };

    console.log(svgEle.getAttribute("width"));
    respJson.width = parseInt(svgEle.getAttribute('width') || '100', 10);
    respJson.height = parseInt(svgEle.getAttribute('height') || '100', 10);
    respJson.items = buildItems(svgEle.childNodes);
    return respJson;
  };  