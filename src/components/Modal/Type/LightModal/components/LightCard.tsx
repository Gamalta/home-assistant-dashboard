import {HassEntityWithService} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import {useLightModalContext} from '../../../../../contexts/LightModalContext';
import {useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {PendantRoundIcon} from '../../../../Icons/PendantRoundIcon';

type LightCardProps = {
  entity: HassEntityWithService<'light'>;
};

export function LightCard(props: LightCardProps) {
  const {entity} = props;
  const {activeEntities, setActiveEntities} = useLightModalContext();
  const cardRef = useRef<HTMLDivElement>(null);

  const color = `rgb(${
    entity.attributes.rgb_color ?? [255, 255, 255].join(',')
  })`;
  const brightness = entity.attributes.brightness ?? 255;
  const activeEntity = activeEntities.includes(entity.entity_id);

  useEffect(() => {
    if (!cardRef.current) return;
    //if (unavailable) return 'inset 0px 0px 10px rgba(0,0,0,0.2)';

    const card = cardRef.current;
    const darkness = 255 - brightness;
    const coef = card.clientHeight / 255;
    const spread = 20;
    const position = spread + darkness * 0.95 * coef;
    let width = card.clientHeight / 2;
    if (darkness > 178.5) {
      width -= ((width - 20) * (darkness - 178.5)) / 76.5;
    }
    let shadowDensity = 0.65;
    if (darkness > 153) {
      shadowDensity -= ((shadowDensity - 0.5) * (darkness - 153)) / 102;
    }
    card.style.boxShadow = `0px 2px 3px rgba(0,0,0,0.4), inset 0px -${position}px ${width}px -${spread}px rgba(0,0,0,${shadowDensity})`;
  }, [brightness, cardRef.current, cardRef.current?.clientHeight]);

  return (
    <Stack
      border={activeEntity ? `2px solid ${color}` : undefined}
      borderRadius={
        activeEntity ? theme => `${theme.shape.borderRadius + 4}px` : 1
      }
      p={activeEntity ? '2px' : 0}
      m={activeEntity ? '-4px' : 0}
    >
      <Stack
        ref={cardRef}
        component={motion.div}
        whileTap={{scale: 0.9}}
        whileHover={{scale: 0.95}}
        borderRadius={1}
        sx={{
          background: color,
          transition: 'all 0.3s ease-out 0s, transform .15s',
        }}
        onClick={() => setActiveEntities([entity.entity_id])}
      >
        <Stack p={2} spacing={1} alignItems="center">
          <PendantRoundIcon />
          <Typography>{entity.attributes.friendly_name}</Typography>
        </Stack>
        <Stack
          alignItems="center"
          boxSizing="content-box"
          sx={{
            background:
              'linear-gradient(rgba(255, 255, 255, 0.1), transparent)',
            borderTop: '1px solid rgba(80, 80, 80, 0.1)',
          }}
        >
          <Switch
            checked={activeEntity}
            onChange={event => {
              setActiveEntities(
                event.target.checked
                  ? [entity.entity_id, ...activeEntities]
                  : activeEntities.filter(
                      entityId => entityId !== entity.entity_id
                    )
              );
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
