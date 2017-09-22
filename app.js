


// d3.json("miserables-2.json", function(error, graph) {
//   if (error) throw error;
//   buildSVG(graph);
// });



//-----------------------



var app = new Vue({
  el: '#app', 
  data: {
    listGroups: ["1", "4", "7"],
    myGraph: {}
  },
  created: function () {
    var self = this;
    d3.json("miserables-2.json", function(error, graph) {
      if (error) throw error;
      self.myGraph = graph;
      buildSVG(graph);
    });
  },
  methods: {
    getNodeObjectById: function (id) {
      for (var node of this.myGraph.nodes) {
        if (node.id == id) {
          return node;
        }
      }
    }
  },
  watch: {
    listGroups: function (newVal, oldVal) {
      // console.log(oldVal);
      // console.log(newVal);
      // console.log(this.myGraph);
      var self = this;
      console.log("-------------");

      var newNodes = this.myGraph.nodes.filter((e) => {
        return newVal.map(parseFloat).indexOf(e.group) > -1;
      });
      var newNodesArray = newNodes.map((e) => {
        return e.id;
      });
      var newLinks = [];
      for (var e of this.myGraph.links) {
        if ((newNodesArray.indexOf(e.source.id) != -1) && (newNodesArray.indexOf(e.target.id) != -1)) {
          newLinks.push(e);
        } else if ((newNodesArray.indexOf(e.source.id) != -1) ^ (newNodesArray.indexOf(e.target.id) != -1)) {
          // Either source or target exists. But not both of them
          // check if you should add new link
          var filteredNode = (newNodesArray.indexOf(e.source.id) != -1) ? e.target.id : e.source.id;
          var notFilteredNode = (newNodesArray.indexOf(e.source.id) != -1) ? e.source.id : e.target.id;
          // Get all nodes linkes to the filtred node
          var linkedNodes = [];
          for (var link of this.myGraph.links) {
            if ((filteredNode == link.source.id) || (filteredNode == link.target.id)) {
              var theOtherNode = (filteredNode == link.source.id) ? link.target.id : link.source.id;
              if (newNodesArray.indexOf(theOtherNode) != -1) {
                if ((theOtherNode != notFilteredNode) && 
                        (newLinks.indexOf({"source": this.getNodeObjectById(notFilteredNode), "target": this.getNodeObjectById(theOtherNode), "value": 20}) == -1 )) { 
                        // Do not add if source==target, or if inverse link was already added
                  newLinks.push({
                    source: this.getNodeObjectById(theOtherNode),
                    target: this.getNodeObjectById(notFilteredNode)
                  });
                }
              }
            }
          }
        } else {
          // Both nodes disapears => no link
        }
      }

      var newGraph = {
        nodes: newNodes,
        links: newLinks
      };

      
      console.log(JSON.stringify(newNodesArray));
      console.log(newGraph);

      buildSVG(newGraph);
    }
  }
})

function buildSVG(graph) {
  d3.select('svg').selectAll('*').remove();
  var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var groupToColor = {
    "1": "blue",
    "4": "red", 
    "7": "green"
  };

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 5)
    .attr("fill", function(d) { return d3.color(groupToColor[d.group]); })
    .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

// var graph = {
//   "nodes": [
//     {"id": "Myriel", "group": 1},
//     {"id": "Napoleon", "group": 1},
//     {"id": "Mlle.Baptistine", "group": 0},
//     {"id": "Mme.Magloire", "group": 7},
//     {"id": "CountessdeLo", "group": 7},
//     {"id": "Geborand", "group": 1},
//     {"id": "Champtercier", "group": 1},
//     {"id": "Cravatte", "group": 0},
//     {"id": "Count", "group": 7},
//     {"id": "OldMan", "group": 1},
//     {"id": "Fauchelevent", "group": 0},
//     {"id": "MotherInnocent", "group": 1},
//     {"id": "Gribier", "group": 0},
//     {"id": "Jondrette", "group": 7},
//     {"id": "Mme.Burgon", "group": 7}
//   ],
//   "links": [
//     {"source": "Napoleon", "target": "Myriel", "value": 1},
//     {"source": "Napoleon", "target": "Myriel", "value": 1},
//     {"source": "Mme.Magloire", "target": "Myriel", "value": 10},
//     {"source": "Mme.Magloire", "target": "Mlle.Baptistine", "value": 6},
//     {"source": "CountessdeLo", "target": "Myriel", "value": 1},
//     {"source": "Geborand", "target": "Myriel", "value": 1},
//     {"source": "Champtercier", "target": "Myriel", "value": 1},
//     {"source": "Cravatte", "target": "Myriel", "value": 1},
//     {"source": "Count", "target": "Myriel", "value": 2},
//     {"source": "OldMan", "target": "Myriel", "value": 1},
//     {"source": "MotherInnocent", "target": "Fauchelevent", "value": 3},
//     {"source": "Gribier", "target": "Fauchelevent", "value": 2},
//     {"source": "Mme.Burgon", "target": "Jondrette", "value": 1},
//     {"source": "Mlle.Baptistine", "target": "MotherInnocent", "value": 1},
//     {"source": "Napoleon", "target": "Jondrette", "value": 1}
//   ]
// }

// var graph2 = {
//   "nodes": [
//     {"id": "Napoleon", "group": 1},
//     {"id": "Mlle.Baptistine", "group": 0},
//     {"id": "Mme.Magloire", "group": 7},
//     {"id": "CountessdeLo", "group": 7},
//     {"id": "Geborand", "group": 1},
//     {"id": "Champtercier", "group": 1},
//     {"id": "Cravatte", "group": 0},
//     {"id": "Count", "group": 7},
//     {"id": "OldMan", "group": 1},
//     {"id": "Fauchelevent", "group": 0},
//     {"id": "MotherInnocent", "group": 1},
//     {"id": "Gribier", "group": 0},
//     {"id": "Jondrette", "group": 7},
//     {"id": "Mme.Burgon", "group": 7}
//   ],
//   "links": [
//     {"source": "MotherInnocent", "target": "Fauchelevent", "value": 3},
//     {"source": "Gribier", "target": "Fauchelevent", "value": 2},
//     {"source": "Mme.Burgon", "target": "Jondrette", "value": 1},
//     {"source": "Mlle.Baptistine", "target": "MotherInnocent", "value": 1},
//     {"source": "Napoleon", "target": "Jondrette", "value": 1}
//   ]
// };