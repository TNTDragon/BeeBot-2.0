module.exports = function (text, fType) {
    var match = false;
    if (fType == "swearFilter") {
    config.filter.blockList.forEach(function (el) {
        if (text.toLowerCase().includes(el)){
            match = true;
        }
    });}
    if (fType == "mod") {
        config.filter.hackList.forEach(function (el) {
        if (text.toLowerCase().includes(el)) {
            match = true;
        }
    });}
    return match;
};