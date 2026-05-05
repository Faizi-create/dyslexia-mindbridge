import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/spacing';
import { ChildProfile } from '@/types';

interface Props {
  children: ChildProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ChildPicker: React.FC<Props> = ({ children, selectedId, onSelect }) => {
  if (children.length <= 1) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {children.map((c) => {
        const active = c.id === selectedId;
        const bg = Colors.childAvatarBg[c.avatarIndex % Colors.childAvatarBg.length];
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <View style={[styles.avatar, { backgroundColor: bg }]}>
              <Text style={styles.initial}>{c.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.name, active && styles.nameActive]}>{c.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { gap: Spacing.sm, paddingVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: '#EAF1FE' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  nameActive: { color: Colors.primaryDark },
});

export default ChildPicker;
