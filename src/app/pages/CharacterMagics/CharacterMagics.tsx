import { useCharacter } from "@/app/hooks/useCharacter"
import { Magics } from "@/data"
import { ButtonCell, Cell, List, Modal } from "@telegram-apps/telegram-ui"

export const CharacterMagics = () => {
  const { character } = useCharacter()

  const Magic = ( { magic, lvl: currentLvl }: {magic: Magics.Magic, lvl: number}) => {
    const { lvl, cost, displayName, desc } = Magics.baseParams[magic]
    return (
      <Modal
        header={<Modal.Header>Only iOS header</Modal.Header>}
        trigger={<ButtonCell>{magic}: {currentLvl}</ButtonCell>}
      >
        <List>
          <Cell subhead='Name'>{ displayName }</Cell>
          <Cell subhead="Description">{ desc }</Cell>
          <Cell subhead="Level">{lvl}</Cell>
          <Cell subhead="Cost">{cost}💧</Cell>
        </List>
      </Modal>
    )
  }
  return (
    <List>
      {Object.entries(character.magics).map(([magic, lvl]) => 
        <Magic key={magic} magic={magic as Magics.Magic} lvl={lvl} />
      )}
    </List>
  )
}