import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The URL of the uploaded media file' })
  @Column()
  url: string;

  @ApiProperty({ description: 'The media type (image, video, audio)' })
  @Column()
  type: string;

  @ApiProperty({ description: 'Metadata including processing details' })
  @Column('json', { nullable: true })
  metadata: any;
}
