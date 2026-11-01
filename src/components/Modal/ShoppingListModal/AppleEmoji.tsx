import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import {appleEmojiUrl} from '../../../utils/appleEmoji';

type AppleEmojiProps = {
  emoji: string;
  size: number;
};

// Le dessin d'iOS sur toutes les plateformes, l'emoji du système hors ligne.
export function AppleEmoji(props: AppleEmojiProps) {
  const {emoji, size} = props;
  const [failed, setFailed] = useState<string>();

  if (failed === emoji) {
    return (
      <Typography component="span" sx={{fontSize: size, lineHeight: 1}}>
        {emoji}
      </Typography>
    );
  }
  return (
    <Box
      component="img"
      src={appleEmojiUrl(emoji)}
      alt={emoji}
      onError={() => setFailed(emoji)}
      // Sans cela, un appui long ouvre le menu de l'image sur Android.
      sx={{width: size, height: size, pointerEvents: 'none'}}
    />
  );
}
