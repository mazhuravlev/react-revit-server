
import {FETCH_MODELS} from "../actions";

export default function reducerTree(state = null, action) {
    if (action.type === FETCH_MODELS) {
        return makeTree(action.payload.data);
    }
    return state;
}

function makeTree(models) {
    const parts = {};
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const modelPathParts = model.fullName.split('\\');
        modelPathParts.pop();
        let partPath = null;
        let currentPart = null;
        for (let j = 0; j < modelPathParts.length; j++) {
            const part = modelPathParts[j];
            partPath = partPath ? partPath + '\\' + part : part;
            if (!parts[partPath]) parts[partPath] = {name: part, path: partPath, parent: currentPart, children: []};
            if (currentPart) currentPart.children.push(parts[partPath]);
            currentPart = parts[partPath];
        }
        if (!currentPart.models) currentPart.models = [];
        currentPart.isPath = true;
        currentPart.models.push(model);
    }
    const tree = {name: '------>', toggled: true, children: []};
    Object.values(parts).filter(x => x.isPath && !x.parent).forEach(x => {
        tree.children.push({name: x.name.replace(/^(\d{4})_/, '$1   '), children: x.models.map(y => ({name: y.name, model: y}))});
    });
    const other = _.sortBy(Object.values(parts).filter(x => x.isPath && x.parent), x => x.path.length);
    other.reverse();
    const pathMap = {};
    other.forEach(x => {
        let t = {name: x.name, children: x.models.map(y => ({name: y.name, model: y}))};
        let parent = x.parent;

        // if(pathMap[x.parent.path]) {
        //     parent = pathMap[x.parent.path];
        // } else {
        //     parent = x.parent;
        //     pathMap[parent.path] = parent;
        // }

        while(parent) {
            if(pathMap[parent.path]) {
                pathMap[parent.path].children = _.uniq(pathMap[parent.path].children.concat(t));
                t = pathMap[parent.path];
            } else {
                t = {name: parent.name.replace(/^(\d{4})_/, '$1   '), children: [t]};
                pathMap[parent.path] = t;
            }
            parent = parent.parent;
        }
        const treeChild = _.find(tree.children, {name: t.name});
        if(treeChild) {
            treeChild.children = _.uniq(treeChild.children.concat(t.children));
        }else {
            tree.children.push(t);
        }

    });
    return tree;
}
