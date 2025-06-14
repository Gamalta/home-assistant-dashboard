import {HassEntityWithService} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import {useLightModalContext} from '../../../../contexts/LightModalContext';
import {useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {useTheme} from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import LinkIcon from '@mui/icons-material/LinkRounded';
import LinkOffIcon from '@mui/icons-material/LinkOffRounded';
import Chip from '@mui/material/Chip';
import {useIcon} from '../../../../hooks/useIcon';

type LightCardProps = {
  entity: HassEntityWithService<'light'>;
  controllableByCurrentTab: boolean;
  onMoveToControllerTab: () => void;
};

export function LightCard(props: LightCardProps) {
  const {entity, controllableByCurrentTab, onMoveToControllerTab} = props;
  const {activeEntityIds, setActiveEntityIds} = useLightModalContext();
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const rgbColor = entity.attributes.rgb_color;
  const hexColor = rgbColor
    ? `#${rgbColor.map(c => c.toString(16).padStart(2, '0')).join('')}`
    : undefined;
  const contrastColor = theme.palette.getContrastText(hexColor ?? '#000');
  const color = `rgb(${
    entity.attributes.rgb_color ?? [255, 255, 255].join(',')
  })`;
  const brightness = entity.attributes.brightness ?? 255;
  const icon = useIcon(entity.attributes.icon);
  const lightOn = entity.state === 'on';
  const activeEntity = activeEntityIds.includes(entity.entity_id);

  useEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;

    if (!lightOn) {
      card.style.boxShadow = 'inset 0px 0px 10px rgba(0,0,0,0.2)';
    }

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
  }, [brightness, cardRef.current?.clientHeight, lightOn]);

  return (
    <Stack
      border={
        activeEntity
          ? `2px solid ${lightOn ? color : 'rgba(102, 102, 102, 0.6)'}`
          : undefined
      }
      borderRadius={
        activeEntity ? theme => `${theme.shape.borderRadius + 4}px` : 1
      }
      p={activeEntity ? '2px' : 0}
      m={activeEntity ? '-4px' : 0}
      sx={{
        transition: 'all 0.3s ease-out 0s, transform .15s',
        opacity: controllableByCurrentTab ? 1 : 0.3,
        '&:hover': {
          opacity: controllableByCurrentTab ? 1 : 0.5,
        },
      }}
      onClick={() => {
        if (!controllableByCurrentTab) {
          onMoveToControllerTab();
        }
        setActiveEntityIds([entity.entity_id]);
      }}
    >
      <Stack
        ref={cardRef}
        component={motion.div}
        whileTap={{scale: 0.9}}
        whileHover={{scale: 0.95}}
        borderRadius={1}
        sx={{
          background: lightOn ? color : 'rgba(102, 102, 102, 0.6)',
          transition: 'all 0.3s ease-out 0s, transform .15s',
        }}
      >
        <Stack direction="row-reverse" justifyContent="space-between" p={1}>
          <IconButton
            size="small"
            sx={{
              opacity: activeEntity ? 0.8 : 0.3,
              background: 'rgba(0,0,0,0.2)',
            }}
            color={activeEntity ? 'primary' : 'inherit'}
            onClick={event => {
              setActiveEntityIds(entities =>
                entities.includes(entity.entity_id)
                  ? entities.filter(entityId => entityId !== entity.entity_id)
                  : [entity.entity_id, ...entities]
              );
              event.stopPropagation();
            }}
          >
            {activeEntity ? <LinkIcon /> : <LinkOffIcon />}
          </IconButton>
          {entity.state === 'unavailable' && (
            <Chip
              sx={{height: '12px', width: '12px', opacity: 0.3}}
              color="error"
            />
          )}
        </Stack>
        <Stack
          p={2}
          spacing={1}
          alignItems="center"
          sx={{
            '& .MuiSvgIcon-root': {
              color: contrastColor,
            },
          }}
        >
          {icon}
          <Typography sx={{color: contrastColor}}>
            {entity.attributes.friendly_name}
          </Typography>
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
            checked={lightOn}
            onClick={event => event.stopPropagation()}
            onChange={() =>
              lightOn ? entity.service.turnOff() : entity.service.turnOn()
            }
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
