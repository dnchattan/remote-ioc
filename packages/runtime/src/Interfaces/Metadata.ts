import { PropertyType } from './PropertyType';

export interface Metadata {
  props: Record<string, PropertyType>;
  hasEvents?: boolean;
}
