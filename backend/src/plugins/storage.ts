import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { S3Client, PutObjectCommand, DeleteObjectCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'
import crypto from 'crypto'
import path from 'path'

declare module 'fastify' {
	interface FastifyInstance {
		storage: {
			upload: (bucket: string, file: Buffer, originalName: string, mimetype: string) => Promise<string>
			delete: (bucket: string, key: string) => Promise<void>
			deleteByUrl: (bucket: string, url: string) => Promise<void>
		}
	}
}

export default fp(async (app: FastifyInstance) => {
	const s3 = new S3Client({
		endpoint: env.MINIO_ENDPOINT,
		region: 'us-east-1',
		credentials: {
			accessKeyId: env.MINIO_USER,
			secretAccessKey: env.MINIO_PASSWORD,
		},
		forcePathStyle: true,
	})

	const setPublicPolicy = async (bucket: string) => {
		const policy = JSON.stringify({
			Version: '2012-10-17',
			Statement: [
				{
					Effect: 'Allow',
					Principal: { AWS: ['*'] },
					Action: ['s3:GetObject'],
					Resource: [`arn:aws:s3:::${bucket}/*`],
				},
			],
		})

		try {
			await s3.send(new PutBucketPolicyCommand({ Bucket: bucket, Policy: policy }))
			app.log.info(`Public read policy set for bucket: ${bucket}`)
		} catch (err) {
			app.log.warn(`Could not set policy for bucket ${bucket}: ${err}`)
		}
	}

	await Promise.allSettled([setPublicPolicy('avatars'), setPublicPolicy('pcb-images')])

	app.decorate('storage', {
		async upload(bucket: string, file: Buffer, originalName: string, mimetype: string): Promise<string> {
			const ext = path.extname(originalName)
			const key = `${crypto.randomUUID()}${ext}`

			await s3.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: key,
					Body: file,
					ContentType: mimetype,
				}),
			)

			return `${bucket}/${key}`
		},

		async delete(bucket: string, key: string): Promise<void> {
			await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
		},

		deleteByUrl: async (bucket: string, url: string): Promise<void> => {
			const key = url.split('/').pop()
			if (!key) return
			await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
		},
	})
})
