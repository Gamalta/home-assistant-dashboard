import {useEffect, useState} from 'react';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import {HassEntityWithService} from '@hakit/core';
import CardActionArea from '@mui/material/CardActionArea';

type LightCardProps = {
  entity: HassEntityWithService<'light'>;
  icon?: React.ReactNode;
  variant?: 'small' | 'normal';
  active?: boolean;
  onClick?(): void;
};

export function LightCard(props: LightCardProps) {
  const {entity, icon, variant = 'normal', active, onClick} = props;

  const [brightness, setBrightness] = useState(
    entity.attributes.brightness
      ? Math.round((entity.attributes.brightness * 100) / 255)
      : 0
  );

  const textColor =
    entity.state === 'on' &&
    (entity.custom.color[0] * 299 +
      entity.custom.color[1] * 587 +
      entity.custom.color[2] * 114) /
      1000 <
      128
      ? 'white'
      : 'black';

  useEffect(() => {
    if (entity.attributes.brightness) {
      setBrightness(Math.round((entity.attributes.brightness * 100) / 255));
    }
  }, [entity.state]);

  return (
    <Card
      sx={{
        background: `linear-gradient(0deg, rgba(0, 0, 0, ${
          ((100 - brightness) * 0.5) / 100 + 0.3
        }) 0%, rgba(255, 255, 255, 0) 100%), ${
          entity.custom.hexColor
        } content-box`,
        ...(variant === 'small' && active
          ? {
              padding: '2px',
              border: `2px solid ${entity.custom.hexColor}`,
            }
          : {margin: '4px'}),
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardHeader
          sx={{
            width: '100%',
            flexDirection: variant === 'small' ? 'column' : 'row',
            '& .MuiCardHeader-avatar': {
              ...(variant === 'small' && {
                mr: 0,
              }),
            },
          }}
          avatar={
            <Avatar
              sx={{
                bgcolor: 'transparent',
                '& svg': {
                  height: 46,
                  width: 46,
                  fill: textColor,
                },
              }}
            >
              {icon}
            </Avatar>
          }
          action={
            <Switch
              checked={entity.state === 'on'}
              onClick={event => {
                event.stopPropagation();
              }}
              onChange={(_, checked) =>
                checked
                  ? entity.service.turnOn()
                  : (entity.service.turnOff(), setBrightness(0))
              }
            />
          }
          title={entity.attributes.friendly_name}
          titleTypographyProps={{
            color: textColor,
            align: variant === 'small' ? 'center' : 'left',
          }}
          subheader={
            variant === 'normal'
              ? entity.state === 'on'
                ? `allumé - ${brightness}%`
                : 'éteint'
              : undefined
          }
          subheaderTypographyProps={{
            color: textColor,
          }}
        />
        {variant === 'normal' && (
          <Box px={2}>
            <Slider
              value={brightness}
              onClick={event => {
                event.stopPropagation();
              }}
              onChange={(_, value) => setBrightness(value as number)}
              onChangeCommitted={(_, value) =>
                entity.service.turnOn({
                  brightness: Math.round((value as number) * 2.55),
                })
              }
            />
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
}
