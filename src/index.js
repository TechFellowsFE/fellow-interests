import Sigma from "sigma";
import Graph from "graphology";
import circular from "graphology-layout/circular";
import forceAtlas2 from "graphology-layout-forceatlas2";

async function getGraph() {
    const response = await fetch('/data.json');
    
    const data = await response.json();

    const graph = new Graph();

    data.forEach((memberData) => {
        const { name, location, interests, knowledges, skills } = memberData;
        
        graph.addNode(name, { nodeType: 'Membro', label: name });

        if (!graph.hasNode(location)) {
            graph.addNode(location, { nodeType: 'Local', label: location });
        }

        graph.addEdge(name, location, { weight: 1 });

        [].concat(interests, knowledges, skills).forEach((subject) => {
            if (!graph.hasNode(subject)) {
                graph.addNode(subject, { nodeType: 'Assunto', label: subject });
            }
        });

        interests.forEach((interest) => graph.addEdge(name, interest, { weight: 1 }));
        knowledges.forEach((knowledge) => graph.addEdge(name, knowledge, { weight: 1 }));
        skills.forEach((skill) => graph.addEdge(name, skill, { weight: 1 }));
    });

    circular.assign(graph);
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, { settings, iterations: 600 });
    
    return graph;
}

async function render() {
    const graph = await getGraph();

    // Retrieve some useful DOM elements:
    const container = document.getElementById("sigma-container");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const zoomResetBtn = document.getElementById("zoom-reset");
    const labelsThresholdRange = document.getElementById("labels-threshold");

    // Instanciate sigma:
    const renderer = new Sigma(graph, container, {
      minCameraRatio: 0.1,
      maxCameraRatio: 10,
    });
    const camera = renderer.getCamera();

    // Bind zoom manipulation buttons
    zoomInBtn.addEventListener("click", () => {
      camera.animatedZoom({ duration: 600 });
    });
    zoomOutBtn.addEventListener("click", () => {
      camera.animatedUnzoom({ duration: 600 });
    });
    zoomResetBtn.addEventListener("click", () => {
      camera.animatedReset({ duration: 600 });
    });

    // Bind labels threshold to range input
    labelsThresholdRange.addEventListener("input", () => {
      renderer.setSetting("labelRenderedSizeThreshold", +labelsThresholdRange.value);
    });

    // Set proper range initial value:
    labelsThresholdRange.value = renderer.getSetting("labelRenderedSizeThreshold") + "";
}

render();