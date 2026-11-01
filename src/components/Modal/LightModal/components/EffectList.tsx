import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

type EffectListProps = {
  effects: string[];
  activeEffects: (string | undefined)[];
  onSelect: (effect: string) => void;
};

export function EffectList(props: EffectListProps) {
  const {effects, activeEffects, onSelect} = props;

  return (
    <Stack direction="row" sx={{flexWrap: 'wrap', gap: 1}}>
      {effects.map(effect => {
        const active = activeEffects.includes(effect);
        return (
          <Chip
            key={effect}
            label={effect}
            color={active ? 'primary' : 'default'}
            variant={active ? 'filled' : 'outlined'}
            aria-pressed={active}
            onClick={() => onSelect(effect)}
          />
        );
      })}
    </Stack>
  );
}
