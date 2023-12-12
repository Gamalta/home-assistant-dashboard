import {
  ButtonCard,
  GarbageCollectionCard,
  Group,
  WeatherCard,
} from '@hakit/components';
import {GarbageCollectionCardProps} from '@hakit/components/dist/types/Cards/GarbageCollectionCard';
import Stack from '@mui/material/Stack';
import {Light} from './components/Light';
import {IrisIcon} from './components/Icons/IrisIcon';

export default function Dashboard() {
  return (
    <Stack gap={2} p={2} direction={{xs: 'column', sm: 'row'}}>
      <Light entity="light.hue_iris" icon={<IrisIcon />} />
      <Light entity="light.hue_play_1" />
      <Light entity="light.salon" />
      <Group title="coucou">
        <WeatherCard
          entity="weather.maison"
          forecastType="hourly"
          lg={6}
          md={6}
          onClick={function io() {}}
          xlg={6}
        />
      </Group>
      <Group title="Lumières" alignItems="stretch">
        <ButtonCard service="toggle" entity="light.hue_play_1" />
        <ButtonCard service="toggle" entity="light.hue_iris" />
      </Group>
      <GarbageCollectionCard
        title="Collecte des déchets"
        schedules={[
          {
            title: 'Poubelle bleue',
            day: 'Saturday',
            frequency: 'weekly',
            weeks: Array(4).fill([
              {color: '#0057D9'},
            ]) as GarbageCollectionCardProps['schedules'][0]['weeks'],
            hideNextCollection: true,
          },
          {
            title: 'Poubelle jaune',
            day: 'Monday',
            frequency: 'weekly',
            weeks: Array(4).fill([
              {color: '#FAED27'},
            ]) as GarbageCollectionCardProps['schedules'][0]['weeks'],
            hideNextCollection: true,
          },
        ]}
      />
    </Stack>
  );
}
