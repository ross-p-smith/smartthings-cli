import { Channel, OrganizationResponse, SmartThingsClient } from '@smartthings/core-sdk'

import { APICommand, ChooseOptions, chooseOptionsWithDefaults, forAllOrganizations, selectFromList,
	stringTranslateToId } from '@smartthings/cli-lib'

import { chooseChannel, listChannels, ChooseChannelOptions, chooseChannelOptionsWithDefaults }
	from '../../../lib/commands/channels-util'
import * as channelsUtil from '../../../lib/commands/channels-util'


jest.mock('@smartthings/cli-lib', () => ({
	...jest.requireActual('@smartthings/cli-lib'),
	chooseOptionsWithDefaults: jest.fn(),
	stringTranslateToId: jest.fn(),
	selectFromList: jest.fn(),
	forAllOrganizations: jest.fn(),
}))


describe('channels-util', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('chooseChannelOptionsWithDefaults', () => {
		const chooseOptionsWithDefaultsMock = jest.mocked(chooseOptionsWithDefaults)

		it('has a reasonable default', () => {
			chooseOptionsWithDefaultsMock.mockReturnValue({} as unknown as ChooseOptions)

			expect(chooseChannelOptionsWithDefaults())
				.toEqual(expect.objectContaining({ includeReadOnly: false }))

			expect(chooseOptionsWithDefaultsMock).toHaveBeenCalledTimes(1)
			expect(chooseOptionsWithDefaultsMock).toHaveBeenCalledWith(undefined)
		})

		it('accepts true value', () => {
			chooseOptionsWithDefaultsMock.mockReturnValue({ includeReadOnly: true } as unknown as ChooseOptions)

			expect(chooseChannelOptionsWithDefaults({ includeReadOnly: true }))
				.toEqual(expect.objectContaining({ includeReadOnly: true }))

			expect(chooseOptionsWithDefaultsMock).toHaveBeenCalledTimes(1)
			expect(chooseOptionsWithDefaultsMock).toHaveBeenCalledWith({ includeReadOnly: true })
		})
	})

	describe('chooseChannel', () => {
		const selectFromListMock = jest.mocked(selectFromList)

		const listChannelsMock = jest.fn()
		const client = { channels: { list: listChannelsMock } }
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const flags = { 'all-organizations': false, 'include-read-only': false }
		const command = { client, flags } as unknown as APICommand<typeof APICommand.flags>

		const chooseChannelOptionsWithDefaultsSpy = jest.spyOn(channelsUtil, 'chooseChannelOptionsWithDefaults')
		const stringTranslateToIdMock = jest.mocked(stringTranslateToId)

		it('uses default channel if specified', async () => {
			chooseChannelOptionsWithDefaultsSpy.mockReturnValueOnce(
				{ allowIndex: false, useConfigDefault: true } as ChooseChannelOptions)
			selectFromListMock.mockImplementation(async () => 'chosen-channel-id')

			expect(await chooseChannel(command, 'prompt message', undefined, { useConfigDefault: true }))
				.toBe('chosen-channel-id')

			expect(chooseChannelOptionsWithDefaultsSpy).toHaveBeenCalledTimes(1)
			expect(chooseChannelOptionsWithDefaultsSpy).toHaveBeenCalledWith({ useConfigDefault: true })
			expect(stringTranslateToIdMock).toHaveBeenCalledTimes(0)
			expect(selectFromListMock).toHaveBeenCalledTimes(1)
			expect(selectFromListMock).toHaveBeenCalledWith(command,
				expect.objectContaining({ primaryKeyName: 'channelId', sortKeyName: 'name' }),
				expect.objectContaining({ configKeyForDefaultValue: 'defaultChannel',
					promptMessage: 'prompt message' }))
		})

		it('translates id from index if allowed', async () => {
			chooseChannelOptionsWithDefaultsSpy.mockReturnValueOnce(
				{ allowIndex: true } as ChooseChannelOptions)
			stringTranslateToIdMock.mockResolvedValueOnce('translated-id')
			selectFromListMock.mockImplementation(async () => 'chosen-channel-id')

			expect(await chooseChannel(command, 'prompt message', 'command-line-channel-id',
				{ allowIndex: true })).toBe('chosen-channel-id')

			expect(chooseChannelOptionsWithDefaultsSpy).toHaveBeenCalledTimes(1)
			expect(chooseChannelOptionsWithDefaultsSpy).toHaveBeenCalledWith({ allowIndex: true })
			expect(stringTranslateToIdMock).toHaveBeenCalledTimes(1)
			expect(stringTranslateToIdMock).toHaveBeenCalledWith(
				expect.objectContaining({ primaryKeyName: 'channelId', sortKeyName: 'name' }),
				'command-line-channel-id', expect.any(Function))
			expect(selectFromListMock).toHaveBeenCalledTimes(1)
			expect(selectFromListMock).toHaveBeenCalledWith(command,
				expect.objectContaining({ primaryKeyName: 'channelId', sortKeyName: 'name' }),
				expect.objectContaining({ preselectedId: 'translated-id' }))
		})

		it('uses list function that lists channels', async () => {
			chooseChannelOptionsWithDefaultsSpy.mockReturnValueOnce(
				{ allowIndex: false, includeReadOnly: false } as ChooseChannelOptions)
			selectFromListMock.mockImplementation(async () => 'chosen-channel-id')

			expect(await chooseChannel(command, 'prompt message', 'command-line-channel-id'))
				.toBe('chosen-channel-id')

			expect(chooseChannelOptionsWithDefaultsSpy).toHaveBeenCalledTimes(1)
			expect(chooseChannelOptionsWithDefaultsSpy).toHaveBeenCalledWith(undefined)
			expect(stringTranslateToIdMock).toHaveBeenCalledTimes(0)
			expect(selectFromListMock).toHaveBeenCalledTimes(1)
			expect(selectFromListMock).toHaveBeenCalledWith(command,
				expect.objectContaining({ primaryKeyName: 'channelId', sortKeyName: 'name' }),
				expect.objectContaining({ preselectedId: 'command-line-channel-id' }))

			const listItems = selectFromListMock.mock.calls[0][2].listItems

			const list = [{ name: 'Channel' }] as Channel[]
			listChannelsMock.mockResolvedValueOnce(list)

			expect(await listItems()).toBe(list)

			expect(listChannelsMock).toHaveBeenCalledTimes(1)
			expect(listChannelsMock).toHaveBeenCalledWith({ includeReadOnly: false })
		})

		it('requests read-only channels when needed', async () => {
			chooseChannelOptionsWithDefaultsSpy.mockReturnValueOnce(
				{ allowIndex: false, includeReadOnly: true } as ChooseChannelOptions)
			selectFromListMock.mockImplementation(async () => 'chosen-channel-id')

			expect(await chooseChannel(command, 'prompt message', 'command-line-channel-id'))
				.toBe('chosen-channel-id')

			expect(chooseChannelOptionsWithDefaultsSpy).toHaveBeenCalledTimes(1)
			expect(chooseChannelOptionsWithDefaultsSpy).toHaveBeenCalledWith(undefined)
			expect(stringTranslateToIdMock).toHaveBeenCalledTimes(0)
			expect(selectFromListMock).toHaveBeenCalledTimes(1)
			expect(selectFromListMock).toHaveBeenCalledWith(command,
				expect.objectContaining({ primaryKeyName: 'channelId', sortKeyName: 'name' }),
				expect.objectContaining({ preselectedId: 'command-line-channel-id' }))

			const listItems = selectFromListMock.mock.calls[0][2].listItems

			const list = [{ name: 'Channel' }] as Channel[]
			listChannelsMock.mockResolvedValueOnce(list)

			expect(await listItems()).toBe(list)

			expect(listChannelsMock).toHaveBeenCalledTimes(1)
			expect(listChannelsMock).toHaveBeenCalledWith({ includeReadOnly: true })
		})
	})

	describe('listChannels', () => {
		const apiListChannelsMock = jest.fn()
		const client = {
			channels: {
				list: apiListChannelsMock,
			},
		} as unknown as SmartThingsClient

		const result = [
			{
				'channelId': 'channel-id',
				'name': 'Channel Name',
			},
		]
		apiListChannelsMock.mockResolvedValue(result)

		it('lists channels', async () => {
			expect(await listChannels(client)).toBe(result)

			expect(apiListChannelsMock).toHaveBeenCalledTimes(1)
			expect(apiListChannelsMock).toHaveBeenCalledWith(expect.not.objectContaining({ includeReadOnly: true }))
		})

		it('lists channels including read-only', async () => {
			expect(await listChannels(client, { allOrganizations: false, includeReadOnly: true })).toBe(result)

			expect(apiListChannelsMock).toHaveBeenCalledTimes(1)
			expect(apiListChannelsMock).toHaveBeenCalledWith({ includeReadOnly: true })
		})

		it('passes subscriber filters on', async () => {
			expect(await listChannels(client, { subscriberType: 'HUB', subscriberId: 'subscriber-id', allOrganizations: false, includeReadOnly: false })).toBe(result)

			expect(apiListChannelsMock).toHaveBeenCalledTimes(1)
			expect(apiListChannelsMock).toHaveBeenCalledWith({
				includeReadOnly: false, subscriberType: 'HUB', subscriberId: 'subscriber-id',
			})
		})

		it('lists channels in all organizations', async () => {
			const thisResult = [
				{ ...result[0], organization: 'Organization One' },
				{ ...result[0], organization: 'Organization Two' },
			]
			const forAllOrganizationsMock = jest.mocked(forAllOrganizations).mockResolvedValueOnce(thisResult)

			expect(await listChannels(client, { allOrganizations: true, includeReadOnly: false })).toStrictEqual(thisResult)

			expect(forAllOrganizationsMock).toHaveBeenCalledTimes(1)
			expect(forAllOrganizationsMock).toHaveBeenCalledWith(client, expect.any(Function))
			expect(apiListChannelsMock).toHaveBeenCalledTimes(0)

			const listChannelsFunction = forAllOrganizationsMock.mock.calls[0][1]

			expect(await listChannelsFunction(client, { organizationId: 'unused' } as OrganizationResponse)).toBe(result)
		})

		it('throws error when both allOrganizations and includeReadOnly included', async () => {
			await expect(listChannels(client, { allOrganizations: true, includeReadOnly: true }))
				.rejects.toThrow('includeReadOnly and allOrganizations options are incompatible')
		})
	})
})
