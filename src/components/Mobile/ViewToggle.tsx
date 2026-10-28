import GridViewIcon from '@mui/icons-material/GridViewRounded';
import ViewInArIcon from '@mui/icons-material/ViewInArRounded';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export type MobileView = 'maison' | 'pieces';

type ViewToggleProps = {
  value: MobileView;
  onChange: (view: MobileView) => void;
};

export function ViewToggle(props: ViewToggleProps) {
  const {value, onChange} = props;

  return (
    <ToggleButtonGroup
      exclusive
      color="primary"
      aria-label="Affichage"
      value={value}
      // Un appui sur la vue déjà affichée ne la désélectionne pas.
      onChange={(_, view: MobileView | null) => view && onChange(view)}
      sx={{
        p: 0.5,
        gap: 0.5,
        borderRadius: 50,
        bgcolor: 'background.paper',
        '& .MuiToggleButtonGroup-grouped': {
          minHeight: 40,
          px: 1.75,
          gap: 0.75,
          border: 0,
          borderRadius: 50,
          textTransform: 'none',
        },
      }}
    >
      <ToggleButton value="maison">
        <ViewInArIcon fontSize="small" />
        3D
      </ToggleButton>
      <ToggleButton value="pieces">
        <GridViewIcon fontSize="small" />
        Pièces
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
