import {sceneUpdates} from './scene';
import {climateUpdates} from './climate';
import {lightUpdates} from './light';
import {mediaPlayerUpdates} from './mediaPlayer';
import {vacuumUpdates} from './vacuum';
import {alarmControlPanelUpdates} from './alarmControlPanel';
import {buttonUpdates} from './button';
import {selectUpdates} from './select';

export default {
  scene: sceneUpdates,
  climate: climateUpdates,
  light: lightUpdates,
  mediaPlayer: mediaPlayerUpdates,
  media_player: mediaPlayerUpdates,
  vacuum: vacuumUpdates,
  alarmControlPanel: alarmControlPanelUpdates,
  alarm_control_panel: alarmControlPanelUpdates,
  button: buttonUpdates,
  select: selectUpdates,
};
