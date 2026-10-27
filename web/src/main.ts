import { registerElements } from "@coverslide/customelement-router";
import "sakura.css/css/sakura-dark.css";
import "./style.css";
import "./elements";

registerElements("app");

document.body.appendChild(document.createElement("main-app",),);
