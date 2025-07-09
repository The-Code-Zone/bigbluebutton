import React, { useRef } from 'react';
import EmojiRain from './component';
import { getEmojisToRain } from './queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import logger from '/imports/startup/client/logger';

const EmojiRainContainer = () => {
  const nowDate = useRef(new Date().toUTCString());

  logger.debug({
    logCode: 'emoji_rain_container_initialization',
  }, 'EmojiRainContainer initialized');

  const {
    data: emojisToRainData,
  } = useDeduplicatedSubscription(getEmojisToRain, {
    variables: {
      initialCursor: nowDate.current,
    },
  });
  const emojisArray = emojisToRainData?.user_reaction_stream || [];

  logger.debug({
    logCode: 'emoji_rain_container_data',
  }, `EmojiRainContainer data fetched: ${emojisArray}`);

  const reactions = emojisArray.length === 0 ? []
    : emojisArray.map((reaction) => ({
      reaction: reaction.reactionEmoji,
      creationDate: new Date(reaction.createdAt),
    }));

  return <EmojiRain reactions={reactions} />;
};

export default EmojiRainContainer;
