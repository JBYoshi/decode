import decode from "./decoders.mjs";
import toString from "./to-string.mjs";

class DecoderTreeElement extends HTMLDivElement {
    constructor() {
        super();

        this.attachShadow({mode: "open"});

        this.header = document.createElement("div");
        this.shadowRoot.appendChild(this.header);

        this.expandContractButton = document.createElement("button");
        this.expandContractButton.onclick = e => this.onExpandContractClicked(e);
        this.header.appendChild(this.expandContractButton);

        this.label = document.createElement("span");
        this.header.appendChild(this.label);

        this.style.marginLeft = "1em";

        this._expanded = false;
        this.expanded = false;
    }

    onExpandContractClicked(e) {
        e.preventDefault();

        this.expanded = !this.expanded;
    }

    get expanded() {
        return this._expanded;
    }

    set expanded(expanded) {
        this._expanded = expanded;
        if (expanded) {
            this.expandContractButton.innerText = "-";
            this.classList.add("expanded");
            
            for (let child of this.childTreeNodes) {
                child.hidden = false;
                child.populateChildren();
            }
            if (this.childTreeNodes.length == 1) {
                this.childTreeNodes[0].expanded = true;
            }
        } else {
            this.expandContractButton.innerText = "+";
            this.classList.remove("expanded");
            if (this.childTreeNodes) {
                for (let child of this.childTreeNodes) {
                    child.hidden = true;
                }
            }
        }
    }

    set data(data) {
        this.label.innerText = [data.title, data.value].filter(x => !!x).map(toString).join(": ");
        this.value = data.value;
        this.childData = data.children;
    }

    populateChildren() {
        if (this.childTreeNodes) return;

        if (!this.childData) this.childData = decode(this.value);
        this.childTreeNodes = this.childData.map(item => {
            let node = new DecoderTreeElement();
            node.data = item;
            node.hidden = true;
            return node;
        });

        for (let child of this.childTreeNodes) {
            this.shadowRoot.appendChild(child);
        }

        this.expandContractButton.hidden = this.childTreeNodes.length == 0;
    }
}

customElements.define("decoder-tree-element", DecoderTreeElement, {extends: "div"});

addEventListener("load", function() {
    let input = document.getElementById("input");
    let output = document.getElementById("output");

    function onInputChanged() {
        output.innerText = null;
        let tree = new DecoderTreeElement();
        tree.data = {value: input.value};
        tree.populateChildren();
        tree.expanded = true;
        output.appendChild(tree);
    }
    input.onchange = input.onkeydown = input.onkeyup = input.onpaste = function() {
        onInputChanged();
    };
    onInputChanged();
});
