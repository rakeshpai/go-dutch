import { FC } from 'hono/jsx';
import { UserId } from '../utils/branded-types';

const palette: [color: string, isTextWhite: boolean][] = [
  ['purple', true],
  ['blue', true],
  ['yellow', false],
  ['black', true],
  ['green', true],
  ['gray', true],
  ['cyan', false],
  ['orange', false],
  ['teal', true],
  ['indigo', true],
  ['pink', false],
  ['red', true],
];

const pickColor = (id: UserId) => {
  const index = id.charCodeAt(0) % palette.length;
  return palette[index];
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2);
};

type Props = {
  size: number;
  name: string;
  id: UserId;
};

const Avatar: FC<Props> = ({ size, name, id }) => {
  const [color, isTextWhite] = pickColor(id);
  return (
    <svg viewBox="0 0 500 500" width={size} height={size}>
      <circle cx="250" cy="250" r="200" fill={color} stroke-width="0" />
      <foreignObject x="0" y="0" width="500" height="500">
        <div
          class="flex justify-center items-center h-full text-[13rem] tracking-wide "
          style={{ color: isTextWhite ? 'white' : 'black' }}
        >
          {getInitials(name)}
        </div>
      </foreignObject>
    </svg>
  );
};

export default Avatar;
