var gates = [];
/*<option value="NOR_an1-AmtR">NOR_an1-AmtR</option>
<option value="NOR_an0-BM3R1">NOR_an0-BM3R1</option>
<option value="NOR_an1-BM3R1">NOR_an1-BM3R1</option>
<option value="NOR_an2-LitR">NOR_an2-LitR</option>
<option value="NOR_an0-PhlF">NOR_an0-PhlF</option>
<option value="NOR_an1-PhlF">NOR_an1-PhlF</option>
<option value="NOR_an2-QacR">NOR_an2-QacR</option>
<option value="NOR_an0-SrpR">NOR_an0-SrpR</option>
<option value="NOR_an1-SrpR">NOR_an1-SrpR</option>
<option value="NOR_an3-SrpR">NOR_an3-SrpR</option>
<option value="NOR_js2-SrpR">NOR_js2-SrpR</option>
<option value="NOR_js2-PhlF">NOR_js2-PhlF</option>
<option value="NOR_js2-BM3R1">NOR_js2-BM3R1</option>
<option value="NOR_js2-AmtR">NOR_js2-AmtR</option>
<option value="NOR_js2-HlyIIR">NOR_js2-HlyIIR</option>
<option value="NOR_js-QacR">NOR_js-QacR</option>
<option value="NOR_js2-LitR">NOR_js2-LitR</option>
<option value="NOR_js2-IcaRA">NOR_js2-IcaRA</option>
<option value="NOR_js2-BetI">NOR_js2-BetI</option>
<option value="NOR_an0-AmeR">NOR_an0-AmeR</option>
<option value="NOR_an2-SrpR">NOR_an2-SrpR</option>
<option value="NOR_an0-QacR">NOR_an0-QacR</option>
<option value="NOR_an1-IcaRA">NOR_an1-IcaRA</option>*/


function create1() {

    var names = '';
    for (var i = 0, element; element = elements[i++];) {
        if(element.checked) {
            names += element.id + ' ';

            var id_table = 'table' + i;
            var id_xfer = 'xfer' + i;
            var id_tox  = 'tox'  + i;
            var id_ON   = 'distr_ON' + i;
            var id_OFF  = 'distr_OFF' + i;
            var id_heatmap  = 'heatmap'+i;
            var id_two_distr= 'two_distr'+i;

            $('#all_figures').append(
                    "<h4>"+element.id+"</h4><br>" +
                    "<div id="+id_table+" class='demo-container' style='height: 260px; width: 200px; float: left'></div>" +
                    "<div id="+id_xfer+" class='demo-container' style='height: 260px; width: 260px; float: left'></div>" +
                    "<div id="+id_two_distr+" style='height:260px; width:260px; float:left'>" +
                    "<div id="+id_ON  +" class='demo-container' style='height: 130px; width: 260px; float: left'></div>" +
                    "<div id="+id_OFF +" class='demo-container' style='height: 130px; width: 260px; float: left'></div>" +
                    "</div>" +
                    "<div id="+id_heatmap+" class='demo-container' style='height: 260px; width: 220px; float: left'></div>" +
                    "<div id="+id_tox +" class='demo-container' style='height: 260px; width: 260px; float: left'></div>" +
                    "<br style='clear: both'>"
            );
            getArrays(element.id, i);
            $('#'+element.id).css('display','none');
        }
    }

}



function getArrays(id, index)
{
    var gateVal = id;
    var tox_inpREU = [];
    var tox_od600 = [];
    var xfer_inpREU = [];
    var xfer_outREUs = [];
    var xfer_inpREUs = [];

    xfer_obj = {};
    part_obj = {};

    Clotho.query("gate", gateVal).then(function (data) {
        var found = false;
        if (data != null) {

            for (var i = 0; i < data.length; i++) {
                var jsonObj = data[i];
                if (jsonObj.schema == "org.cellocad.gate_parts") {
                    part_obj["ribozyme"]    = jsonObj.ribozyme;
                    part_obj["rbs"]         = jsonObj.rbs;
                    part_obj["cds"]         = jsonObj.cds;
                    part_obj["terminator"]  = jsonObj.terminator;
                    part_obj["promoter"]    = jsonObj.promoter;
                }
                if (jsonObj.schema == "org.cellocad.gate_transfer_function") {
                    xfer_obj["pmax"] = jsonObj.pmax;
                    xfer_obj["pmin"] = jsonObj.pmin;
                    xfer_obj["k"] = jsonObj.k;
                    xfer_obj["n"] = jsonObj.n;
                }
                if (jsonObj.schema == "org.cellocad.gate_toxicity") {
                    tox_inpREU.push( jsonObj.inreu );
                    tox_od600.push(  jsonObj.od600 );
                }
                if (jsonObj.schema == "org.cellocad.gate_cytometry") {
                    xfer_inpREU.push(jsonObj.inreu);

                    var this_inpreus = [];
                    for(var j=0; j<jsonObj.outreu.length; ++j) {
                        this_inpreus.push(jsonObj.outreu[j]["x"]);
                    }
                    xfer_inpREUs.push(this_inpreus);

                    var this_outreus = [];
                    for(var j=0; j<jsonObj.outreu.length; ++j) {
                        this_outreus.push(jsonObj.outreu[j]["y"]);
                    }
                    xfer_outREUs.push(this_outreus);
                }
            }

            found = true;
        }
        if (!found) {
            alert("No results found");
        }

        fillGatePartsTable(id, index, part_obj, xfer_obj);

        plotTransferFunction(id, index, xfer_obj);

        plotToxicity(id, index, tox_inpREU, tox_od600);

        plotDistributions(id, index, xfer_inpREUs, xfer_outREUs);

        plotHeatmap(id, index, xfer_inpREUs, xfer_outREUs);

        //$('#tables').css('display', 'block');
        //$('#transfer_fn').css('display', 'block');
        //$('#toxicity').css('display', 'block');
        //$('#single_distr').css('display', 'block');
    }).done();

}

function fillGatePartsTable(id, index, part_obj) {

    var x = "";
    x += "<table>";
    x += "<tr><td>Ribozyme:</td><td><input type='text' size='15' value='"+part_obj['ribozyme']+"'></td></tr>";
    x += "<tr><td>RBS:</td><td><input type='text' size='15' value='"+part_obj['rbs']+"'></td></tr>";
    x += "<tr><td>CDS:</td><td><input type='text' size='15' value='"+part_obj['cds']+"'></td></tr>";
    x += "<tr><td>Terminator:</td><td><input type='text' size='15' value='"+part_obj['terminator']+"'></td></tr>";
    x += "<tr><td>Promoter:</td><td><input type='text' size='15' value='"+part_obj['promoter']+"'></td></tr>";
    x += "<tr><td>pmax:</td><td><input type='text' size='15' value='"+xfer_obj['pmax']+"'></td></tr>";
    x += "<tr><td>pmin:</td><td><input type='text' size='15' value='"+xfer_obj['pmin']+"'></td></tr>";
    x += "<tr><td>kd:</td><td><input type='text' size='15' value='"+xfer_obj['k']+"'></td></tr>";
    x += "<tr><td>n:</td><td><input type='text' size='15' value='"+xfer_obj['n']+"'></td></tr>";
    x += "</table>";
    $('#table'+index).html(x);

}


function plotHeatmap(id, index, xfer_inpREUs, xfer_outREUs) {

    var data = [];

    for(var t=0; t<12; ++t) {
        for(var u=60; u<200; ++u) {
            var obj = {};
            obj["score"] = xfer_outREUs[t][u]*10;
            obj["row"] = t;
            obj["col"] = 199-u;
            data.push(obj);
        }
    }

    //height of each row in the heatmap
    //width of each column in the heatmap
    var gridSize = 100,
        h = 1.5,
        w = 18;

    var colorLow = 'white', colorMed = 'white', colorHigh = 'black';

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 640 - margin.left - margin.right,
        height = 380 - margin.top - margin.bottom;

    var colorScale = d3.scale.linear()
        .domain([-1, 0, 1])
        .range([colorLow, colorMed, colorHigh]);

    var svg = d3.select("#heatmap"+index).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var heatMap = svg.selectAll(".heatmap"+index)
        .data(data, function(d) { return d.col + ':' + d.row; })
        .enter().append("svg:rect")
        .attr("x", function(d) { return d.row * w; })
        .attr("y", function(d) { return d.col * h; })
        .attr("width", function(d) { return w; })
        .attr("height", function(d) { return h; })
        .style("fill", function(d) { return colorScale(d.score); });

}


function plotDistributions(id, index, inpREUs, outREUs) {

    var d1 = [];
    for(var i=0; i<outREUs[0].length; ++i) {
        var x = Number(inpREUs[0][i]);
        var y = Number(outREUs[0][i]);
        d1.push([i, y]);
    }

    var d2 = [];
    for(var i=0; i<outREUs[11].length; ++i) {
        var x = Number(inpREUs[11][i]);
        var y = Number(outREUs[11][i]);
        d2.push([i, y]);
    }

    var options = {
        //lines: { show: true, lineWidth:5 },
        xaxis: {
            axisLabel: 'input R.E.U.', ticks: []},
            //axisLabel: 'input R.E.U.', ticks: [0.001,0.01,0.1,1,10,100], min: 0.01, max:100,
            //transform:  function(v) {return Math.log(v+0.0001); }, tickDecimals:2},
        yaxis: { axisLabel: 'output R.E.U.', min:0.0, max: 0.08},
        grid: { hoverable: true, clickable: true , color: "#999999"}
    };

    $.plot($("#distr_ON"+index), [
        {
            data: d1,
            color:'#1F78B4',
            bars: {
                show: true
            },
            label: id + " ON state"
        }
    ], options);

    $.plot($("#distr_OFF"+index), [
        {
            data: d2,
            color:'#1F78B4',
            bars: {
                show: true
            },
            label: id + " OFF state"
        }
    ], options);
}




function plotToxicity(id, index, tox_inpREU, tox_od600) {

    var d1 = [];
    for(var i=0; i<tox_inpREU.length; ++i) {
        var x = Number(tox_inpREU[i]);
        var y = Number(tox_od600[i]);

        d1.push([x, y]);
    }

    var options = {
        lines: {show: true, lineWidth:5},
        xaxis: {
            axisLabel: 'input R.E.U.', ticks: [0.001,0.01,0.1,1,10,100], min: 0.02, max:25,
            transform:  function(v) {return Math.log(v+0.0001); }, tickDecimals:2 },
        yaxis: {
            axisLabel: '%OD600', min:0.0, max:1.4},
        grid: { hoverable: true, clickable: true, color: "#999"}
    }

    $.plot($('#tox'+index),
        [
            {label: id + " growth curve", data: d1, color:'green'}
        ], options);
}



function plotTransferFunction(id, index, xfer_obj) {
    var pmax = Number(xfer_obj["pmax"]);
    var pmin = Number(xfer_obj["pmin"]);
    var kd =   Number(xfer_obj["k"]);
    var n =    Number(xfer_obj["n"]);

    //var pmax = 15.0;
    //var pmin = 0.15;
    //var kd = 0.1;
    //var n = 2;

    var options = {
        lines: { show: true, lineWidth:5 },
        xaxis: { axisLabel: 'input R.E.U.', ticks: [0.001,0.01,0.1,1,10,100], min: 0.01, max:50,
            transform:  function(v) {return Math.log(v+0.0001); }, tickDecimals:2 },
        yaxis: { axisLabel: 'output R.E.U.', ticks: [0.001,0.01,0.1,1,10,100], min: 0.01, max:50,
            transform:  function(v) {return Math.log(v+0.0001); }, tickDecimals:2 },
        grid: { hoverable: true, clickable: true , color: "#999"}
    };

    var data1 = sampleFunction( 0.1, 1, function(x){ return pmin + (pmax-pmin)/( 1+Math.pow((x/kd),n ) ) } );

    $.plot($("#xfer"+index),
        [
            { label: id + " transfer fn", data: data1, color:'#EE0000'}
        ], options);

}
function sampleFunction(x1, x2, func) {
    var d = [ ];
    var logx1 = Math.log(x1);
    var logx2 = Math.log(x2);

    var step = (logx2-logx1)/300;
    for (var i = logx1; i < logx2; i += step ) {
        var pow_i = Math.pow(i,10);
        d.push([pow_i, func( pow_i ) ]);
    }

    return d;
}