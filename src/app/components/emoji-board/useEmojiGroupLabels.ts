import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmojiGroupId } from '../../plugins/emoji';

export type IEmojiGroupLabels = Record<EmojiGroupId, string>;

export const useEmojiGroupLabels = (): IEmojiGroupLabels => {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      [EmojiGroupId.People]: t('components:emoji-board.smileys_people'),
      [EmojiGroupId.Nature]: t('components:emoji-board.animals_nature'),
      [EmojiGroupId.Food]: t('components:emoji-board.food_drinks'),
      [EmojiGroupId.Activity]: t('components:emoji-board.activity'),
      [EmojiGroupId.Travel]: t('components:emoji-board.travel_places'),
      [EmojiGroupId.Object]: t('components:emoji-board.objects'),
      [EmojiGroupId.Symbol]: t('components:emoji-board.symbols'),
      [EmojiGroupId.Flag]: t('components:emoji-board.flags'),
    }),
    [t]
  );
};
