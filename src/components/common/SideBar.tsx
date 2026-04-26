import {
  Box,
  Button,
  Drawer,
  Portal,
  useMediaQuery,
  CloseButton,
  Text,
  HStack,
  VStack,
} from '@chakra-ui/react'

import { resetProfile } from '@/redux/slices/profileSlice.ts'
import { useDispatch } from 'react-redux'
import { ToasterUtil } from './ToasterUtil'
import { BsLayoutSidebarInset } from '@/components/icons'
import { clearLoading, setLoading } from '@/redux/slices/uiSlice'
import { SidebarNav } from './SidebarNav'
import { logoutService } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export const SideBar = () => {
  const toastFunc = ToasterUtil()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [buttonTop, setButtonTop] = useState(88)
  const dragStartYRef = useRef(0)
  const dragStartTopRef = useRef(88)
  const isDraggingRef = useRef(false)

  const dispatch = useDispatch()

  const handleLogout = async () => {
    dispatch(setLoading({ loading: true, message: 'Logging out...' }))
    try {
      await logoutService()
      dispatch(resetProfile())
      toastFunc('Logged out successfully', 'success')
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      toastFunc('Error logging out. Please try again.', 'error')
    } finally {
      dispatch(clearLoading())
    }
  }

  const [isLarge] = useMediaQuery(['(min-width: 768px)'])

  useEffect(() => {
    const clampTop = () => {
      const maxTop = Math.max(72, window.innerHeight - 96)
      setButtonTop((current) => Math.min(Math.max(current, 72), maxTop))
    }

    window.addEventListener('resize', clampTop)
    clampTop()

    return () => {
      window.removeEventListener('resize', clampTop)
    }
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return

      const deltaY = event.clientY - dragStartYRef.current
      const maxTop = Math.max(72, window.innerHeight - 96)
      const nextTop = Math.min(Math.max(dragStartTopRef.current + deltaY, 72), maxTop)
      setButtonTop(nextTop)
    }

    const handlePointerUp = () => {
      isDraggingRef.current = false
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  const handleButtonPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    isDraggingRef.current = true
    dragStartYRef.current = event.clientY
    dragStartTopRef.current = buttonTop
  }

  return (
    <>
      {isLarge ? (
        <Box
          w="280px"
          h="100vh"
          bg="linear-gradient(180deg, #0f172a 0%, #111827 100%)"
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          position="relative"
          boxShadow="inset -1px 0 0 rgba(255,255,255,0.08)"
        >
          <Box position="sticky" top="0" zIndex="1" px={5} pt={5} pb={4}>
            <Box
              p={3}
              borderRadius="14px"
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <Text fontSize="lg" fontWeight="800" color="white" letterSpacing="0.02em">
                EBILL
              </Text>
            </Box>
          </Box>
          <Box
            flex="1"
            overflowY="auto"
            px={5}
            pb="24px"
            css={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <SidebarNav />
          </Box>
          <Box px={5} pb={5}>
            <Button
              aria-label="logout"
              w="full"
              h="40px"
              justifyContent="space-between"
              borderRadius="12px"
              bg="whiteAlpha.200"
              color="white"
              border="1px solid"
              borderColor="whiteAlpha.300"
              _hover={{ bg: 'whiteAlpha.300' }}
              onClick={handleLogout}
            >
              Logout
              <LogOut size={15} />
            </Button>
          </Box>
        </Box>
      ) : (
        <Drawer.Root
          placement="start"
          size="xs"
          open={drawerOpen}
          onOpenChange={(e) => setDrawerOpen(e.open)}
        >
          <Drawer.Trigger asChild>
            <Button
              position="fixed"
              top={`${buttonTop}px`}
              left="0"
              zIndex={1200}
              w="52px"
              h="58px"
              minW="52px"
              p={0}
              borderRadius="0 16px 16px 0"
              bg="rgba(15,23,42,0.92)"
              color="white"
              border="1px solid"
              borderColor="whiteAlpha.300"
              borderLeft="none"
              boxShadow="0 10px 24px rgba(15,23,42,0.22)"
              _hover={{ bg: 'rgba(30,41,59,0.96)' }}
              _active={{ bg: 'rgba(30,41,59,1)' }}
              aria-label="Open navigation menu"
              touchAction="none"
              onPointerDown={handleButtonPointerDown}
            >
              <VStack gap={0.5}>
                <BsLayoutSidebarInset />
                <Text fontSize="10px" fontWeight="700" letterSpacing="0.08em">
                  MENU
                </Text>
              </VStack>
            </Button>
          </Drawer.Trigger>

          <Portal>
            <Drawer.Backdrop bg="rgba(15,23,42,0.42)" backdropFilter="blur(4px)" />

            <Drawer.Positioner>
              <Drawer.Content
                bg="linear-gradient(180deg, #0f172a 0%, #111827 100%)"
                h="100vh"
                maxW="320px"
                display="flex"
                flexDirection="column"
                color="white"
                border="none"
                boxShadow="0 0 0 1px rgba(255,255,255,0.06), 0 24px 60px rgba(15,23,42,0.45)"
              >
                <Drawer.Header px={4} pt={5} pb={2}>
                  <Drawer.Title w="full">
                    <VStack align="stretch" gap={2}>
                      <Box
                        p={3}
                        borderRadius="16px"
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                      >
                        <Text fontSize="lg" fontWeight="800" color="white" letterSpacing="0.04em">
                          EBILL
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                          Quick navigation for billing, stock, team, and reports.
                        </Text>
                      </Box>
                    </VStack>
                  </Drawer.Title>
                </Drawer.Header>

                <Drawer.Body
                  flex="1"
                  overflowY="auto"
                  px={4}
                  pt={3}
                  pb={4}
                  css={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                  }}
                >
                  <SidebarNav onNavigate={() => setDrawerOpen(false)} />
                </Drawer.Body>

                <Drawer.Footer bg="transparent" px={4} pb={5} pt={1}>
                  <VStack w="full" gap={3}>
                    <Button
                      aria-label="logout"
                      w="full"
                      h="46px"
                      justifyContent="space-between"
                      borderRadius="14px"
                      bg="whiteAlpha.200"
                      color="white"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      _hover={{ bg: 'whiteAlpha.300' }}
                      onClick={handleLogout}
                    >
                      Logout
                      <LogOut size={15} />
                    </Button>
                    <Text fontSize="11px" color="whiteAlpha.600" textAlign="center">
                      Tap anywhere outside to close the menu.
                    </Text>
                  </VStack>
                </Drawer.Footer>

                <Drawer.CloseTrigger asChild>
                  <CloseButton
                    size="sm"
                    position="absolute"
                    top="4"
                    right="4"
                    borderRadius="full"
                    bg="whiteAlpha.100"
                    _hover={{ bg: 'whiteAlpha.200' }}
                  />
                </Drawer.CloseTrigger>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      )}
    </>
  )
}
