import { XStack, YStack, Text } from 'tamagui'
import { format, addDays, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

type TimelineGridProps = {
  startDate: Date
  days: number
  dayWidth: number
}

export function TimelineGrid({ startDate, days, dayWidth }: TimelineGridProps) {
  const dates = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, days - 1),
  })

  return (
    <XStack height={50} borderBottomWidth={1} borderColor="$color4">
      {dates.map((date, index) => (
        <YStack
          key={date.toISOString()}
          width={dayWidth}
          borderRightWidth={1}
          borderColor="$color4"
          alignItems="center"
          justifyContent="center"
          backgroundColor={index % 2 === 0 ? '$color2' : '$background'}
        >
          <Text fontSize={10} color="$color10" fontWeight="600">
            {format(date, 'MMM')}
          </Text>
          <Text fontSize={12} color="$color12" fontWeight="700">
            {format(date, 'd')}
          </Text>
        </YStack>
      ))}
    </XStack>
  )
}
