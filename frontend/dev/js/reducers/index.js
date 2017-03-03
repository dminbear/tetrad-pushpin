import {combineReducers} from 'redux';
import UserReducer from './reducer-users';
import ActiveUserReducer from './reducer-active-user';
import LibReducer from './library-reducer';
import SliderReducer from './slider-reducer';
import CanvasReducer from './canvas-reducer';
import CanvasObjectReducer from './canvas2-reducer';

/*
 * We combine all reducers into a single object before updated data is dispatched (sent) to store
 * Your entire applications state (store) is just whatever gets returned from all your reducers
 * */

const allReducers = combineReducers({
    slider: SliderReducer,
    users: UserReducer,
    activeUser: ActiveUserReducer,
    library: LibReducer,
    preview: CanvasReducer,
    canvasObjectState: CanvasObjectReducer
});

export default allReducers
