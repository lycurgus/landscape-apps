import React, { useCallback, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DragUpdate,
  DraggableLocation,
} from 'react-beautiful-dnd';
import bigInt from 'big-integer';
import { formatUv } from '@urbit/aura';
import { useGroup, useRouteGroup } from '../../state/groups';
import { Channel } from '../../types/groups';
import AdminChannelListItem from './AdminChannelListItem';
import AdminChannelListSections from './AdminChannelListSections';
import ChannelManagerHeader from './ChannelManagerHeader';

interface AdminChannelListContentsProps {
  sectionedChannels: SectionMap;
}

type SectionMap = {
  [key: string]: SectionListItem;
};

interface ChannelListItem {
  key: string;
  channel: Channel;
}

interface SectionListItem {
  title: string;
  channels: ChannelListItem[];
}

export default function AdminChannelListDropContext({
  sectionedChannels,
}: AdminChannelListContentsProps) {
  const initialChannels = sectionedChannels;
  const [sections, setSections] = useState<SectionMap>(initialChannels);
  const [orderedSections, setOrderedSections] = useState(
    Object.keys(initialChannels)
  );

  const addSection = () => {
    const nextSection = {
      title: '',
      channels: [],
    };

    const nextSectionId = formatUv(bigInt(Date.now()));
    const nextSections = {
      ...sections,
      [nextSectionId]: nextSection,
    };

    const nextOrderedSections = orderedSections;

    nextOrderedSections.splice(1, 0, nextSectionId);
    setSections(nextSections);
    setOrderedSections(nextOrderedSections);
  };

  const reorder = useCallback(
    (array: any[], sourceIndex: number, destinationIndex: number) => {
      const result = Array.from(array);
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destinationIndex, 0, removed);
      return result;
    },
    []
  );

  const reorderSectionMap = useCallback(
    (
      sectionMap: SectionMap,
      source: DraggableLocation,
      destination: DraggableLocation
    ) => {
      const current = [...sectionMap[source.droppableId].channels];
      const next = [...sectionMap[destination.droppableId].channels];
      const target = current[source.index];

      // move to same list
      if (source.droppableId === destination.droppableId) {
        const reordered = reorder(current, source.index, destination.index);
        const result: SectionMap = {
          ...sectionMap,
          [source.droppableId]: {
            title: sectionMap[source.droppableId].title,
            channels: reordered,
          },
        };
        return result;
      }

      // move to different list
      current.splice(source.index, 1);
      next.splice(destination.index, 0, target);
      const result: SectionMap = {
        ...sectionMap,
        [source.droppableId]: {
          title: sectionMap[source.droppableId].title,
          channels: current,
        },
        [destination.droppableId]: {
          title: sectionMap[destination.droppableId].title,
          channels: next,
        },
      };

      return result;
    },
    [reorder]
  );

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;

      if (!destination) {
        return;
      }

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      if (result.type === 'SECTIONS') {
        const newOrder = reorder(
          orderedSections,
          source.index,
          destination.index
        );
        setOrderedSections(newOrder);
        return;
      }

      const nextMap = reorderSectionMap(sections, source, destination);

      setSections(nextMap);
    },
    [orderedSections, reorder, reorderSectionMap, sections]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ChannelManagerHeader addSection={addSection} />
      <AdminChannelListSections
        sections={sections}
        orderedSections={orderedSections}
      />
    </DragDropContext>
  );
}
