(function() {
  angular.module('treeNetwork')
    .directive('network',
      function() {
        return {
          restrict: 'E',
          scope: {
            selectedNode: '='
          },
          template: '<div class="col-md-8"></div>',
          replace: false,
          link: function(scope, el) {

            scope.$watch('selectedNode', function(oVal, nVal) {
              el.empty();
              // el.remove();

              var m = [20, 120, 20, 120],
                w = 800 - m[1] - m[3],
                h = 600 - m[0] - m[2],
                i = 0,
                root;

              var tree = d3.layout.tree()
                .size([h, w]);

              var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                  return [d.y, d.x];
                });

              var colourMap = {
                "1": "#993404",
                "5": "#993404",
                "6": "#d95f0e",
                "2": "#fe9929",
                "3": "#fed98e",
                "4": "#ffffd4"
              }
              var c = d3.scale.category10().domain(d3.range(10));

              // variables for drag/drop
              var selectedNode = null;
              var draggingNode = null;
              // panning variables
              var panSpeed = 200;
              var panBoundary = 20; // Within 20px from edges will pan when dragging.
              // Misc. variables
              var i = 0;
              var duration = 750;

              // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
              var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
              var scale = zoomListener.scale();
              var vis = d3.select(el[0]).append("svg:svg")
                .attr("width", w + m[1] + m[3])
                .attr("height", h + m[0] + m[2])
                // .append("svg:g")
                .attr("class", "overlay")
                .call(zoomListener);


              // Append a group which holds all nodes and which the zoom Listener can act upon.
              var svgGroup = vis.append("g");
              // .attr("transform", "translate(" + m[3] + "," + m[0] + ")")


              var added = [];

              d3.json("data/movie-network-25-7-3.json", function(arrayJson) {
                // var rootLabel = "Business Solutions Analyst";
                var rootLabel = scope.selectedNode.label;
                added.push(rootLabel);
                var roles = transformArray2obj(arrayJson);
                var careerTree = addNodes(roles, rootLabel);
                root = careerTree;
                root.x0 = h / 2;
                root.y0 = 0;

                function toggleAll(d) {
                  if (d.children) {
                    d.children.forEach(toggleAll);
                    toggle(roles, d);
                  }
                }
                if (rootLabel == "The Dark Knight (2008)") {
                  // Initialize the display to show a few nodes.
                  root.children.forEach(toggleAll);
                  toggle(roles, root.children[4]);
                  toggle(roles, root.children[4].children[5]);
                }



                update(roles, root);
                centerNode(root);


              });

              function update(roles, source) {
                var duration = d3.event && d3.event.altKey ? 5000 : 500;

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse();

                // Normalize for fixed-depth.
                nodes.forEach(function(d) {
                  d.y = d.depth * 180;
                });

                // Update the nodes…
                var node = svgGroup.selectAll("g.node")
                  .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                  });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("svg:g")
                  .attr("class", "node")
                  .attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                  })
                  .on("click", function(d) {
                    toggle(roles, d);
                    update(roles, d);
                  });

                nodeEnter.append("svg:circle")
                  .attr("r", 1e-6)
                  .style("fill", function(d) {
                    if (d._children || (!d.children && !d._children)) {
                      return c(d.director);
                    } else {
                      return "#fff";
                    }
                  })
                  .style("stroke", function(d) {
                    return c(d.director);
                  });

                nodeEnter.append("svg:text")
                  .attr("x", function(d) {
                    return d.children || d._children ? -10 : 10;
                  })
                  .attr("dy", ".35em")
                  .attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start";
                  })
                  .text(function(d) {
                    return d.label;
                  })
                  .style("fill-opacity", 1e-6);

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                  .duration(duration)
                  .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                  });

                nodeUpdate.select("circle")
                  .attr("r", 4.5)
                  .style("fill", function(d) {
                    if (d._children || (!d.children && !d._children)) {
                      if (d.children || d._children) {
                      }                      
                      return c(d.director);
                    } else {
                      return "#fff";
                    }
                  })
                  .style("stroke", function(d) {
                    return c(d.director);
                  });

                nodeUpdate.select("text")
                  .style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                  .duration(duration)
                  .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                  })
                  .remove();

                nodeExit.select("circle")
                  .attr("r", 1e-6);

                nodeExit.select("text")
                  .style("fill-opacity", 1e-6);

                // Update the links…
                var link = svgGroup.selectAll("path.link")
                  .data(tree.links(nodes), function(d) {
                    return d.target.id;
                  });

                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g")
                  .attr("class", "link")
                  .attr("d", function(d) {
                    var o = {
                      x: source.x0,
                      y: source.y0
                    };
                    return diagonal({
                      source: o,
                      target: o
                    });
                  })
                  .transition()
                  .duration(duration)
                  .attr("d", diagonal);

                // Transition links to their new position.
                link.transition()
                  .duration(duration)
                  .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                  .duration(duration)
                  .attr("d", function(d) {
                    var o = {
                      x: source.x,
                      y: source.y
                    };
                    return diagonal({
                      source: o,
                      target: o
                    });
                  })
                  .remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                  d.x0 = d.x;
                  d.y0 = d.y;
                });
              }

              // Toggle children.
              function toggle(roles, d) {
                if (d.children) {
                  d._children = addChildren(roles, d.label, d.children);
                  d.children = null;
                  added.splice(added.indexOf(d.label));

                } else {
                  if (added.length == 1 || added.indexOf(d.label) == -1) {

                    d.children = addChildren(roles, d.label, d._children);
                    d._children = null;
                  }
                }
              }

              function addNodes(roles, label) {
                var careerTree = {
                  "label": label
                };
                for (var role in roles) {
                  if (roles[role]['label'] == label) {
                    careerTree['children'] = roles[role]['children'];
                    careerTree['director'] = roles[role]['director'];
                    added.push(label);
                  }
                }
                console.log(careerTree);
                return careerTree
              }

              function addChildren(roles, label, children) {
                var thing = addNodes(roles, label)

                return thing.children;
              }


              function transformArray2obj(jsonArray) {
                var treeObj = {}
                var labelToObj = {};
                for (var i = 0; i < jsonArray.nodes.length; i++) {
                  labelToObj[jsonArray.nodes[i]['label']] = jsonArray.nodes[i];
                }

                for (var key in labelToObj) {
                  var children = [];
                  for (var i = 0; i < jsonArray.links.length; i++) {
                    if (jsonArray.nodes[jsonArray.links[i].source].label == key) {
                      //
                      var child = {
                        "label": jsonArray.nodes[jsonArray.links[i].target].label,
                        "weight": jsonArray.links[i].weight,
                        "director": jsonArray.nodes[jsonArray.links[i].source].director
                      };
                      children.push(child);
                    }
                  }
                  labelToObj[key]["children"] = children;
                }
                return labelToObj;
              }

              // TODO: Pan function, can be better implemented.

              function pan(domNode, direction) {
                var speed = panSpeed;
                if (panTimer) {
                  clearTimeout(panTimer);
                  translateCoords = d3.transform(svgGroup.attr("transform"));
                  if (direction == 'left' || direction == 'right') {
                    translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                    translateY = translateCoords.translate[1];
                  } else if (direction == 'up' || direction == 'down') {
                    translateX = translateCoords.translate[0];
                    translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
                  }
                  scaleX = translateCoords.scale[0];
                  scaleY = translateCoords.scale[1];
                  scale = zoomListener.scale();
                  svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
                  d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
                  zoomListener.scale(zoomListener.scale());
                  zoomListener.translate([translateX, translateY]);
                  panTimer = setTimeout(function() {
                    pan(domNode, speed, direction);
                  }, 50);
                }
              }

              // Define the zoom function for the zoomable tree

              function zoom() {
                svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
              }







              // Helper functions for collapsing and expanding nodes.

              function collapse(d) {
                if (d.children) {
                  d._children = d.children;
                  d._children.forEach(collapse);
                  d.children = null;
                }
              }

              function expand(d) {
                if (d._children) {
                  d.children = d._children;
                  d.children.forEach(expand);
                  d._children = null;
                }
              }

              var overCircle = function(d) {
                selectedNode = d;
                updateTempConnector();
              };
              var outCircle = function(d) {
                selectedNode = null;
                updateTempConnector();
              };


              // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

              function centerNode(source) {
                var scale = zoomListener.scale();
                var x = -source.y0;
                var y = -source.x0;
                x = x * scale + w / 3;
                y = y * scale + h / 2;
                d3.select('g').transition()
                  .duration(duration)
                  .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
                zoomListener.scale(scale);
                zoomListener.translate([x, y]);
              }

            })
          }
        };
      }
  )
}());