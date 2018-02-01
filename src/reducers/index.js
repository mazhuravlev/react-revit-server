import {combineReducers} from 'redux';
import reducerModels from "./reducer_models";
import reducerModelDetails from "./reducer_model_details";
import reducerTree from "./reducer_tree";
import reducerHistory from "./reducer_history";
import reducerSettings from "./reducer_settings";
import reducerModelsWeek from "./reducer_modelsWeek";
import reducerA360 from './reducer_a360';
import reducerDownload from './reducer_download';

const rootReducer = combineReducers({
    models: reducerModels,
    details: reducerModelDetails,
    tree: reducerTree,
    history: reducerHistory,
    settings: reducerSettings,
    modelsWeek: reducerModelsWeek,
    a360: reducerA360,
    download: reducerDownload
});

export default rootReducer;
