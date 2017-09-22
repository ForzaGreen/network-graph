
var app = new Vue({
  el: '#app', 
  data: {
    listGroups: ["1", "2", "3", "4", "5", "6", "7"],
    myGraph: {}
  },
  created: function () {
    var self = this;

    d3.json("data.json", function(error, graph) {
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

  //TODO: Synchronize with HTML colors
  var groupToColor = {
    "1": "#00457D",
    "2": "#5768F2",
    "3": "#585858",
    "4": "#01DFA5",
    "5": "#FFBF00",
    "6": "#D8D8D8"
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
    // This does not allow the node to go beyond svg limits
    node
        .attr("cx", function(d) { return d.x = Math.max(15, Math.min(width - 15, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(15, Math.min(height - 15, d.y)); });

    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

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

