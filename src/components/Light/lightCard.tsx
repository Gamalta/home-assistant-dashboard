import React, {useEffect, useState} from 'react';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import {EntityName, FilterByDomain, useEntity} from '@hakit/core';

type LightCardProps = {
  entity: FilterByDomain<EntityName, 'light'>;
  icon?: React.ReactNode;
  variant?: 'small' | 'normal';
  active?: boolean;
  onClick?(): void;
};

export function LightCard(props: LightCardProps) {
  const {entity, icon, variant = 'normal', active, onClick} = props;

  const light = useEntity(entity);

  const [brightness, setBrightness] = useState(
    light.attributes.brightness
      ? Math.round((light.attributes.brightness * 100) / 255)
      : 0
  );

  const textColor =
    light.state === 'on' &&
    (light.custom.color[0] * 299 +
      light.custom.color[1] * 587 +
      light.custom.color[2] * 114) /
      1000 <
      128
      ? 'white'
      : 'black';

  useEffect(() => {
    if (light.attributes.brightness) {
      setBrightness(Math.round((light.attributes.brightness * 100) / 255));
    }
  }, [light.state]);

  return (
    <Card
      sx={{
        background: `linear-gradient(0deg, rgba(0, 0, 0, ${
          ((100 - brightness) * 0.5) / 100 + 0.3
        }) 0%, rgba(255, 255, 255, 0) 100%), ${
          light.custom.hexColor
        } content-box`,
        ...(variant === 'small' && active
          ? {
              padding: '2px',
              border: `2px solid ${light.custom.hexColor}`,
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
              checked={light.state === 'on'}
              onClick={event => {
                event.stopPropagation();
              }}
              onChange={(_, checked) =>
                checked
                  ? light.service.turnOn()
                  : (light.service.turnOff(), setBrightness(0))
              }
            />
          }
          title={light.attributes.friendly_name}
          titleTypographyProps={{
            color: textColor,
            align: variant === 'small' ? 'center' : 'left',
          }}
          subheader={
            variant === 'normal'
              ? light.state === 'on'
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
                light.service.turnOn({
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
